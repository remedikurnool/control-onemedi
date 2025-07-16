# 🔐 SETUP DEMO USERS - COMPLETE INSTRUCTIONS

## ❌ **CURRENT ISSUE:**
**Login credentials are not working because demo users are not properly set up in the database.**

---

## ✅ **SOLUTION - FOLLOW THESE STEPS:**

### **Step 1: Open Supabase Dashboard**
1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard)
2. Sign in to your account
3. Select your project: `ambbtidyplqdzjtzbwac`

### **Step 2: Access SQL Editor**
1. In the left sidebar, click on **"SQL Editor"**
2. Click **"New Query"** button

### **Step 3: Run the Setup Script**
1. Copy the **ENTIRE CONTENT** from the file: `setup-demo-users.sql`
2. Paste it into the SQL Editor
3. Click **"Run"** button (or press Ctrl+Enter)

### **Step 4: Verify Success**
You should see output like:
```
NOTICE: === DEMO LOGIN CREDENTIALS ===
NOTICE: Super Admin: superadmin@onemedi.com / SuperAdmin@123
NOTICE: Admin: admin@onemedi.com / Admin@123
NOTICE: Manager: manager@onemedi.com / Manager@123
...
NOTICE: All users created successfully!
```

---

## 🚀 **WORKING DEMO CREDENTIALS:**

After running the script, these credentials will work:

### **🔴 SUPER ADMIN**
```
Email: superadmin@onemedi.com
Password: SuperAdmin@123
```

### **🔵 ADMIN**
```
Email: admin@onemedi.com
Password: Admin@123
```

### **🟢 MANAGER**
```
Email: manager@onemedi.com
Password: Manager@123
```

### **🟣 DOCTOR**
```
Email: doctor@onemedi.com
Password: Doctor@123
```

### **🟠 PHARMACIST**
```
Email: pharmacist@onemedi.com
Password: Pharma@123
```

### **🔵 LAB TECHNICIAN**
```
Email: labtech@onemedi.com
Password: LabTech@123
```

### **🟡 FRONT DESK**
```
Email: frontdesk@onemedi.com
Password: FrontDesk@123
```

### **🟢 NURSE**
```
Email: nurse@onemedi.com
Password: Nurse@123
```

### **⚪ CUSTOMER**
```
Email: customer@onemedi.com
Password: Customer@123
```

---

## 🧪 **TESTING THE LOGIN:**

### **Method 1: Use the Login Page**
1. Navigate to: **http://localhost:8080/login**
2. Click on any demo credential button to auto-fill
3. Click "Sign In"

### **Method 2: Use the Test Button**
1. On the login page, click **"Test Login"** button
2. It will automatically test the admin credentials
3. If successful, credentials will be auto-filled

### **Method 3: Browser Console Testing**
1. Open browser console (F12)
2. Navigate to: **http://localhost:8080/login**
3. Run: `testAllDemoCredentials()`
4. This will test all credentials and show results

---

## 🔧 **TROUBLESHOOTING:**

### **Issue: "Invalid login credentials"**
**Cause:** Demo users not created in database
**Solution:** Run the `setup-demo-users.sql` script

### **Issue: "User profile not found"**
**Cause:** Auth user exists but no profile record
**Solution:** Run the `setup-demo-users.sql` script (it handles both)

### **Issue: "Account is inactive"**
**Cause:** User profile has `is_active = false`
**Solution:** Run the script or manually update:
```sql
UPDATE user_profiles SET is_active = true WHERE email LIKE '%@onemedi.com';
```

### **Issue: SQL script fails**
**Cause:** Missing permissions or table structure issues
**Solution:** 
1. Ensure you're running as the project owner
2. Check if tables exist: `SELECT * FROM user_profiles LIMIT 1;`
3. If tables don't exist, run the migration scripts first

---

## 📋 **VERIFICATION CHECKLIST:**

### **✅ Before Testing:**
- [ ] Supabase project is active and accessible
- [ ] SQL script executed successfully without errors
- [ ] Demo users appear in the verification query results
- [ ] Development server is running on http://localhost:8080

### **✅ After Setup:**
- [ ] Can access login page at http://localhost:8080/login
- [ ] Demo credential buttons are visible
- [ ] Test login button works
- [ ] Can successfully log in with any demo credential
- [ ] Redirected to appropriate dashboard based on role

---

## 🎯 **EXPECTED BEHAVIOR:**

### **Successful Login Flow:**
1. **Enter credentials** → Auto-fill or manual entry
2. **Authentication** → Supabase auth validates password
3. **Profile Loading** → User profile fetched from database
4. **Role Check** → Permissions and role verified
5. **Redirect** → Navigate to appropriate dashboard
6. **Welcome Message** → Toast notification with user name

### **Role-Based Redirects:**
- **Super Admin, Admin, Manager** → `/admin` (Admin Dashboard)
- **Doctor, Pharmacist, Lab Tech, Front Desk, Nurse** → `/admin` (Role-specific modules)
- **Customer** → `/dashboard` (Customer Dashboard)

---

## 🚨 **IMPORTANT NOTES:**

### **Security:**
- These are **DEMO CREDENTIALS** for development only
- **NEVER use these in production**
- Change all passwords before deploying to production

### **Database:**
- The script creates users in both `auth.users` and `user_profiles` tables
- Passwords are properly encrypted using bcrypt
- All users are set to active by default

### **Development:**
- Demo users are automatically created with proper roles and permissions
- Each role has specific module access as defined in the permissions JSON
- Users can be modified or extended as needed

---

## 📞 **NEED HELP?**

### **Quick Fixes:**
1. **Clear browser cache** and try again
2. **Restart development server**: `npm run dev`
3. **Check browser console** for detailed error messages
4. **Verify Supabase connection** in network tab

### **Still Not Working?**
1. Check the GitHub issue created for this setup
2. Verify your `.env` file has correct Supabase credentials
3. Ensure your Supabase project is not paused or suspended
4. Try creating a single user manually to test the flow

---

## 🎉 **SUCCESS INDICATORS:**

### **✅ Setup Complete When:**
- All 9 demo users created successfully
- Login page loads without errors
- Demo credential buttons work
- Test login button shows success
- Can log in and access admin panel
- Role-based access control working

### **🚀 Ready to Use:**
Once setup is complete, you'll have a fully functional authentication system with 9 different user roles for comprehensive testing of the OneMedi Healthcare Platform.

---

*Setup Instructions Created: 2024*
*Status: Ready for Implementation*
