import { Loader } from '@googlemaps/js-api-loader';

// Types for Google Maps integration
export interface MapConfig {
  center: google.maps.LatLng;
  zoom: number;
  apiKey: string;
}

export interface ServiceZone {
  id: string;
  name: string;
  type: 'delivery' | 'pickup' | 'emergency' | 'restricted' | 'premium';
  geometry: GeoJSON.Polygon | GeoJSON.MultiPolygon;
  color: string;
  serviceTypes: string[];
  isActive: boolean;
}

export interface ZoneDrawingOptions {
  fillColor: string;
  fillOpacity: number;
  strokeColor: string;
  strokeWeight: number;
  editable: boolean;
  draggable: boolean;
}

export interface RouteCalculationResult {
  distance: string;
  duration: string;
  route: google.maps.DirectionsRoute;
  estimatedCost: number;
}

export interface GeocodeResult {
  address: string;
  coordinates: google.maps.LatLng;
  placeId: string;
  addressComponents: google.maps.GeocoderAddressComponent[];
}

// Advanced Google Maps Service for One Medi Healthcare Platform
export class AdvancedMapsService {
  private map: google.maps.Map | null = null;
  private drawingManager: google.maps.drawing.DrawingManager | null = null;
  private geocoder: google.maps.Geocoder | null = null;
  private placesService: google.maps.places.PlacesService | null = null;
  private directionsService: google.maps.DirectionsService | null = null;
  private directionsRenderer: google.maps.DirectionsRenderer | null = null;
  private distanceMatrixService: google.maps.DistanceMatrixService | null = null;
  
  private zones: Map<string, google.maps.Polygon> = new Map();
  private markers: Map<string, google.maps.Marker> = new Map();
  private infoWindows: Map<string, google.maps.InfoWindow> = new Map();
  
  private onZoneCreated?: (zone: ServiceZone) => void;
  private onZoneUpdated?: (zone: ServiceZone) => void;
  private onZoneDeleted?: (zoneId: string) => void;

  constructor() {
    this.initializeServices();
  }

  // Initialize Google Maps services
  private async initializeServices(): Promise<void> {
    this.geocoder = new google.maps.Geocoder();
    this.directionsService = new google.maps.DirectionsService();
    this.directionsRenderer = new google.maps.DirectionsRenderer({
      suppressMarkers: false,
      draggable: true
    });
    this.distanceMatrixService = new google.maps.DistanceMatrixService();
  }

  // Initialize advanced map with healthcare-specific styling
  async initializeMap(
    container: HTMLElement, 
    config: MapConfig,
    options?: {
      onZoneCreated?: (zone: ServiceZone) => void;
      onZoneUpdated?: (zone: ServiceZone) => void;
      onZoneDeleted?: (zoneId: string) => void;
    }
  ): Promise<google.maps.Map> {
    try {
      const loader = new Loader({
        apiKey: config.apiKey,
        version: 'weekly',
        libraries: ['places', 'drawing', 'geometry', 'visualization']
      });

      await loader.load();

      // Set up event handlers
      if (options) {
        this.onZoneCreated = options.onZoneCreated;
        this.onZoneUpdated = options.onZoneUpdated;
        this.onZoneDeleted = options.onZoneDeleted;
      }

      // Create map with healthcare-specific styling
      this.map = new google.maps.Map(container, {
        center: config.center,
        zoom: config.zoom,
        mapTypeId: google.maps.MapTypeId.ROADMAP,
        styles: this.getHealthcareMapStyles(),
        gestureHandling: 'cooperative',
        zoomControl: true,
        mapTypeControl: true,
        scaleControl: true,
        streetViewControl: true,
        rotateControl: true,
        fullscreenControl: true,
        clickableIcons: true
      });

      // Initialize services that require map
      this.placesService = new google.maps.places.PlacesService(this.map);
      this.directionsRenderer?.setMap(this.map);

      // Initialize drawing tools
      this.initializeDrawingTools();

      return this.map;
    } catch (error) {
      console.error('Error initializing Google Maps:', error);
      throw new Error('Failed to initialize Google Maps. Please check your API key and internet connection.');
    }
  }

  // Initialize drawing tools for zone creation
  private initializeDrawingTools(): void {
    if (!this.map) return;

    this.drawingManager = new google.maps.drawing.DrawingManager({
      drawingMode: null,
      drawingControl: true,
      drawingControlOptions: {
        position: google.maps.ControlPosition.TOP_CENTER,
        drawingModes: [
          google.maps.drawing.OverlayType.POLYGON,
          google.maps.drawing.OverlayType.CIRCLE,
          google.maps.drawing.OverlayType.RECTANGLE
        ]
      },
      polygonOptions: this.getDefaultZoneOptions(),
      circleOptions: this.getDefaultZoneOptions(),
      rectangleOptions: this.getDefaultZoneOptions()
    });

    this.drawingManager.setMap(this.map);

    // Handle drawing completion
    this.drawingManager.addListener('overlaycomplete', (event: google.maps.drawing.OverlayCompleteEvent) => {
      this.handleDrawingComplete(event);
    });
  }

  // Handle zone drawing completion
  private handleDrawingComplete(event: google.maps.drawing.OverlayCompleteEvent): void {
    const overlay = event.overlay;
    const type = event.type;

    // Convert overlay to polygon for consistent handling
    let polygon: google.maps.Polygon;
    
    if (type === google.maps.drawing.OverlayType.POLYGON) {
      polygon = overlay as google.maps.Polygon;
    } else if (type === google.maps.drawing.OverlayType.CIRCLE) {
      polygon = this.circleToPolygon(overlay as google.maps.Circle);
      overlay.setMap(null); // Remove the circle
    } else if (type === google.maps.drawing.OverlayType.RECTANGLE) {
      polygon = this.rectangleToPolygon(overlay as google.maps.Rectangle);
      overlay.setMap(null); // Remove the rectangle
    } else {
      return;
    }

    // Generate zone ID and create zone object
    const zoneId = this.generateZoneId();
    const zone: ServiceZone = {
      id: zoneId,
      name: `Zone ${zoneId.slice(-4)}`,
      type: 'delivery',
      geometry: this.polygonToGeoJSON(polygon),
      color: '#3b82f6',
      serviceTypes: [],
      isActive: true
    };

    // Store polygon reference
    this.zones.set(zoneId, polygon);

    // Add click listener for zone selection
    polygon.addListener('click', () => {
      this.selectZone(zoneId);
    });

    // Add edit listeners
    polygon.addListener('mouseup', () => {
      this.handleZoneEdit(zoneId);
    });

    // Disable drawing mode
    this.drawingManager?.setDrawingMode(null);

    // Trigger zone created callback
    if (this.onZoneCreated) {
      this.onZoneCreated(zone);
    }
  }

  // Convert circle to polygon for consistent handling
  private circleToPolygon(circle: google.maps.Circle): google.maps.Polygon {
    const center = circle.getCenter()!;
    const radius = circle.getRadius();
    const points: google.maps.LatLng[] = [];
    
    // Create polygon with 32 points around the circle
    for (let i = 0; i < 32; i++) {
      const angle = (i * 360 / 32) * Math.PI / 180;
      const point = google.maps.geometry.spherical.computeOffset(center, radius, angle * 180 / Math.PI);
      points.push(point);
    }

    return new google.maps.Polygon({
      paths: points,
      ...this.getDefaultZoneOptions()
    });
  }

  // Convert rectangle to polygon
  private rectangleToPolygon(rectangle: google.maps.Rectangle): google.maps.Polygon {
    const bounds = rectangle.getBounds()!;
    const ne = bounds.getNorthEast();
    const sw = bounds.getSouthWest();
    
    const points = [
      new google.maps.LatLng(ne.lat(), ne.lng()),
      new google.maps.LatLng(ne.lat(), sw.lng()),
      new google.maps.LatLng(sw.lat(), sw.lng()),
      new google.maps.LatLng(sw.lat(), ne.lng())
    ];

    return new google.maps.Polygon({
      paths: points,
      ...this.getDefaultZoneOptions()
    });
  }

  // Convert polygon to GeoJSON
  polygonToGeoJSON(polygon: google.maps.Polygon): GeoJSON.Polygon {
    const path = polygon.getPath();
    const coordinates: number[][] = [];
    
    for (let i = 0; i < path.getLength(); i++) {
      const point = path.getAt(i);
      coordinates.push([point.lng(), point.lat()]);
    }
    
    // Close the polygon
    if (coordinates.length > 0) {
      coordinates.push(coordinates[0]);
    }

    return {
      type: 'Polygon',
      coordinates: [coordinates]
    };
  }

  // Create polygon from GeoJSON
  createPolygonFromGeoJSON(geoJson: GeoJSON.Polygon, options?: ZoneDrawingOptions): google.maps.Polygon {
    const coordinates = geoJson.coordinates[0];
    const path: google.maps.LatLng[] = coordinates.map(coord => 
      new google.maps.LatLng(coord[1], coord[0])
    );

    return new google.maps.Polygon({
      paths: path,
      ...this.getDefaultZoneOptions(),
      ...options
    });
  }

  // Geocoding with enhanced error handling
  async geocodeAddress(address: string): Promise<GeocodeResult[]> {
    if (!this.geocoder) {
      throw new Error('Geocoder not initialized');
    }

    return new Promise((resolve, reject) => {
      this.geocoder!.geocode({ 
        address,
        region: 'IN', // Bias towards India
        componentRestrictions: { country: 'IN' }
      }, (results, status) => {
        if (status === 'OK' && results && results.length > 0) {
          const geocodeResults: GeocodeResult[] = results.map(result => ({
            address: result.formatted_address,
            coordinates: result.geometry.location,
            placeId: result.place_id,
            addressComponents: result.address_components
          }));
          resolve(geocodeResults);
        } else {
          reject(new Error(`Geocoding failed: ${status}`));
        }
      });
    });
  }

  // Enhanced address autocomplete
  setupAddressAutocomplete(
    input: HTMLInputElement, 
    options?: {
      types?: string[];
      componentRestrictions?: google.maps.places.ComponentRestrictions;
      bounds?: google.maps.LatLngBounds;
    }
  ): google.maps.places.Autocomplete {
    const autocompleteOptions: google.maps.places.AutocompleteOptions = {
      types: options?.types || ['address'],
      componentRestrictions: options?.componentRestrictions || { country: 'IN' },
      fields: ['place_id', 'geometry', 'name', 'formatted_address', 'address_components']
    };

    if (options?.bounds) {
      autocompleteOptions.bounds = options.bounds;
    } else if (this.map) {
      autocompleteOptions.bounds = this.map.getBounds() || undefined;
    }

    const autocomplete = new google.maps.places.Autocomplete(input, autocompleteOptions);

    if (this.map) {
      autocomplete.bindTo('bounds', this.map);
    }

    return autocomplete;
  }

  // Calculate delivery routes with optimization
  async calculateOptimizedRoute(
    origin: google.maps.LatLng,
    destination: google.maps.LatLng,
    waypoints?: google.maps.DirectionsWaypoint[],
    options?: {
      avoidHighways?: boolean;
      avoidTolls?: boolean;
      travelMode?: google.maps.TravelMode;
    }
  ): Promise<RouteCalculationResult> {
    if (!this.directionsService) {
      throw new Error('Directions service not initialized');
    }

    return new Promise((resolve, reject) => {
      this.directionsService!.route({
        origin,
        destination,
        waypoints: waypoints || [],
        optimizeWaypoints: true,
        travelMode: options?.travelMode || google.maps.TravelMode.DRIVING,
        avoidHighways: options?.avoidHighways || false,
        avoidTolls: options?.avoidTolls || false,
        region: 'IN'
      }, (result, status) => {
        if (status === 'OK' && result) {
          const route = result.routes[0];
          const leg = route.legs[0];
          
          // Calculate estimated cost based on distance (₹10 per km base rate)
          const distanceInKm = leg.distance?.value ? leg.distance.value / 1000 : 0;
          const estimatedCost = Math.max(50, distanceInKm * 10); // Minimum ₹50

          resolve({
            distance: leg.distance?.text || '0 km',
            duration: leg.duration?.text || '0 mins',
            route,
            estimatedCost
          });
        } else {
          reject(new Error(`Route calculation failed: ${status}`));
        }
      });
    });
  }

  // Check if point is within any zone
  isPointInAnyZone(point: google.maps.LatLng): string | null {
    for (const [zoneId, polygon] of this.zones) {
      if (google.maps.geometry.poly.containsLocation(point, polygon)) {
        return zoneId;
      }
    }
    return null;
  }

  // Get default zone drawing options
  private getDefaultZoneOptions(): ZoneDrawingOptions {
    return {
      fillColor: '#3b82f6',
      fillOpacity: 0.3,
      strokeColor: '#1d4ed8',
      strokeWeight: 2,
      editable: true,
      draggable: false
    };
  }

  // Healthcare-specific map styling
  private getHealthcareMapStyles(): google.maps.MapTypeStyle[] {
    return [
      {
        featureType: 'poi.medical',
        elementType: 'geometry',
        stylers: [{ color: '#e3f2fd' }]
      },
      {
        featureType: 'poi.medical',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#1976d2' }]
      },
      {
        featureType: 'poi.medical',
        elementType: 'labels.icon',
        stylers: [{ color: '#1976d2' }]
      },
      {
        featureType: 'poi.pharmacy',
        elementType: 'geometry',
        stylers: [{ color: '#f3e5f5' }]
      },
      {
        featureType: 'poi.pharmacy',
        elementType: 'labels.text.fill',
        stylers: [{ color: '#7b1fa2' }]
      }
    ];
  }

  // Generate unique zone ID
  private generateZoneId(): string {
    return `zone_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Handle zone selection
  private selectZone(zoneId: string): void {
    // Highlight selected zone
    const polygon = this.zones.get(zoneId);
    if (polygon) {
      polygon.setOptions({
        strokeWeight: 4,
        strokeColor: '#ff6b35'
      });
    }

    // Reset other zones
    for (const [id, poly] of this.zones) {
      if (id !== zoneId) {
        poly.setOptions(this.getDefaultZoneOptions());
      }
    }
  }

  // Handle zone editing
  private handleZoneEdit(zoneId: string): void {
    const polygon = this.zones.get(zoneId);
    if (polygon && this.onZoneUpdated) {
      const updatedZone: ServiceZone = {
        id: zoneId,
        name: `Zone ${zoneId.slice(-4)}`,
        type: 'delivery',
        geometry: this.polygonToGeoJSON(polygon),
        color: '#3b82f6',
        serviceTypes: [],
        isActive: true
      };
      this.onZoneUpdated(updatedZone);
    }
  }

  // Load existing zones on map
  loadZones(zones: ServiceZone[]): void {
    // Clear existing zones
    this.clearZones();

    // Add each zone to map
    zones.forEach(zone => {
      const polygon = this.createPolygonFromGeoJSON(zone.geometry, {
        fillColor: zone.color,
        fillOpacity: 0.3,
        strokeColor: zone.color,
        strokeWeight: 2,
        editable: true,
        draggable: false
      });

      polygon.setMap(this.map);
      this.zones.set(zone.id, polygon);

      // Add event listeners
      polygon.addListener('click', () => this.selectZone(zone.id));
      polygon.addListener('mouseup', () => this.handleZoneEdit(zone.id));
    });
  }

  // Clear all zones from map
  clearZones(): void {
    for (const polygon of this.zones.values()) {
      polygon.setMap(null);
    }
    this.zones.clear();
  }

  // Fit map to show all zones
  fitMapToZones(): void {
    if (!this.map || this.zones.size === 0) return;

    const bounds = new google.maps.LatLngBounds();
    
    for (const polygon of this.zones.values()) {
      const path = polygon.getPath();
      for (let i = 0; i < path.getLength(); i++) {
        bounds.extend(path.getAt(i));
      }
    }

    this.map.fitBounds(bounds);
  }

  // Enable/disable drawing mode
  setDrawingMode(mode: google.maps.drawing.OverlayType | null): void {
    if (this.drawingManager) {
      this.drawingManager.setDrawingMode(mode);
    }
  }

  // Get map instance
  getMap(): google.maps.Map | null {
    return this.map;
  }

  // Cleanup resources
  destroy(): void {
    this.clearZones();
    if (this.drawingManager) {
      this.drawingManager.setMap(null);
    }
    if (this.directionsRenderer) {
      this.directionsRenderer.setMap(null);
    }
  }
}
