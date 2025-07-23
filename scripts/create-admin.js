// This script creates an admin user via API call using child_process
const { exec } = require('child_process');

function createAdmin() {
  console.log('Creating admin user via API...');
  
  const curlCommand = `curl -X POST http://localhost:3000/api/admin/create-admin \
    -H "Content-Type: application/json" \
    -d '{"username":"admin","password":"admin"}'`;
  
  exec(curlCommand, (error, stdout, stderr) => {
    if (error) {
      console.error('Error creating admin user:', error.message);
      console.log('Make sure the development server is running (npm run dev)');
      return;
    }
    
    if (stderr) {
      console.error('stderr:', stderr);
      return;
    }
    
    try {
      const response = JSON.parse(stdout);
      console.log('Admin user created successfully:', response.message);
    } catch (parseError) {
      console.log('Response:', stdout);
    }
  });
}

createAdmin();