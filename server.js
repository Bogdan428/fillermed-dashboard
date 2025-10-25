const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const session = require('express-session');
const { MongoClient } = require('mongodb');

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Configuration
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fillermed-admin:FillerMed2025!@fillermed.jk1v6hh.mongodb.net/?retryWrites=true&w=majority&appName=fillermed';
let db;
let mongoClient;

// Database connection status
let isConnected = false;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware
app.use(session({
  secret: 'filler-med-secret-key-2024',
  resave: false,
  saveUninitialized: false,
  cookie: { 
    secure: false, // Set to true if using HTTPS
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Authentication middleware
function requireAuth(req, res, next) {
  if (req.session && req.session.userId) {
    return next();
  } else {
    return res.status(401).json({ error: 'Authentication required' });
  }
}

app.use(express.static('.'));

// Connect to MongoDB
async function connectToMongoDB() {
  try {
    mongoClient = new MongoClient(MONGODB_URI, {
      serverSelectionTimeoutMS: 5000, // 5 second timeout
      connectTimeoutMS: 10000, // 10 second timeout
      socketTimeoutMS: 45000, // 45 second timeout
    });
    
    await mongoClient.connect();
    db = mongoClient.db('fillermed');
    isConnected = true;
    
    console.log('✅ Connected to MongoDB Atlas');
    
    // Test connection by checking collections
    const collections = await db.listCollections().toArray();
    console.log('📊 Available collections:', collections.map(c => c.name));
    
    // Initialize collections (without sample data)
    await initializeCollections();
    
    // Set up connection monitoring
    mongoClient.on('error', (error) => {
      console.error('❌ MongoDB connection error:', error);
      isConnected = false;
    });
    
    mongoClient.on('close', () => {
      console.log('🔌 MongoDB connection closed');
      isConnected = false;
    });
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    console.log('🔄 Falling back to mock data...');
    isConnected = false;
    // Fallback to mock data if MongoDB fails
    initializeMockData();
  }
}

// Check if database is connected and working
async function checkDatabaseConnection() {
  if (!isConnected || !db) {
    return false;
  }
  
  try {
    // Simple ping to check connection
    await db.admin().ping();
    return true;
  } catch (error) {
    console.error('❌ Database connection check failed:', error);
    isConnected = false;
    return false;
  }
}

// Initialize collections and sample data
async function initializeCollections() {
  try {
    // Check if users collection exists and has data
    const usersCount = await db.collection('users').countDocuments();
    if (usersCount === 0) {
      // Create default receptionist user
      await db.collection('users').insertOne({
        id: 'user-1',
        username: 'receptionist',
        password: 'welcome123',
        role: 'receptionist',
        createdAt: new Date()
      });
      console.log('👤 Default receptionist user created');
    }

    // Check if patients collection exists (but don't create sample data)
    const patientsCount = await db.collection('patients').countDocuments();
    console.log(`📊 Patients collection ready with ${patientsCount} patients`);

    // Check if appointments collection exists (but don't create sample data)
    const appointmentsCount = await db.collection('appointments').countDocuments();
    console.log(`📅 Appointments collection ready with ${appointmentsCount} appointments`);
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

// Fallback mock data (if MongoDB fails)
function initializeMockData() {
  console.log('📊 Using mock data (in-memory)');
}

// Mock data storage (in-memory) - fallback only
let mockData = {
  users: [
    {
      id: 'user-1',
      username: 'receptionist',
      password: 'welcome123',
      role: 'receptionist'
    }
  ],
  patients: [],
  appointments: []
};

console.log('Mock data initialized');

// API Routes

// Authentication routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ error: 'Username and password are required' });
  }
  
  try {
    let user;
    
    if (db) {
      // Use MongoDB
      user = await db.collection('users').findOne({ username });
    } else {
      // Fallback to mock data
      user = mockData.users.find(u => u.username === username);
    }
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Set session
    req.session.userId = user.id;
    req.session.username = user.username;
    req.session.role = user.role;
    
    res.json({ 
      message: 'Login successful',
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logout successful' });
  });
});

app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ 
      authenticated: true,
      user: {
        id: req.session.userId,
        username: req.session.username,
        role: req.session.role
      }
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Protected routes - require authentication
// Disabled for easy access - no authentication required
// app.use('/api/patients', requireAuth);
// app.use('/api/appointments', requireAuth);
// app.use('/api/dashboard', requireAuth);

// Get all patients
app.get('/api/patients', async (req, res) => {
  try {
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const patients = await db.collection('patients').find({}).toArray();
      res.json(patients);
    } else {
      console.log('🔄 Using mock data for patients');
      res.json(mockData.patients);
    }
  } catch (error) {
    console.error('Error fetching patients:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get patient by ID
app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    let patient;
    
    if (db) {
      patient = await db.collection('patients').findOne({ id });
    } else {
      patient = mockData.patients.find(p => p.id === id);
    }
    
    if (!patient) {
      return res.status(404).json({ error: 'Patient not found' });
    }
    
    res.json(patient);
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new patient
app.post('/api/patients', async (req, res) => {
  const patientData = req.body;
  const id = uuidv4();
  
  try {
    const newPatient = {
      id,
      ...patientData,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (db) {
      await db.collection('patients').insertOne(newPatient);
    } else {
      mockData.patients.push(newPatient);
    }
    
    res.json({ id, message: 'Patient created successfully' });
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update patient
app.put('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    if (db) {
      const result = await db.collection('patients').updateOne(
        { id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }
    } else {
      const patientIndex = mockData.patients.findIndex(p => p.id === id);
      
      if (patientIndex === -1) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      mockData.patients[patientIndex] = {
        ...mockData.patients[patientIndex],
        ...updateData
      };
    }
    
    res.json({ message: 'Patient updated successfully' });
  } catch (error) {
    console.error('Error updating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete patient
app.delete('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (db) {
      const result = await db.collection('patients').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }
    } else {
      const patientIndex = mockData.patients.findIndex(p => p.id === id);
      
      if (patientIndex === -1) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      mockData.patients.splice(patientIndex, 1);
    }
    
    res.json({ message: 'Patient deleted successfully' });
  } catch (error) {
    console.error('Error deleting patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all appointments
app.get('/api/appointments', async (req, res) => {
  try {
    if (db) {
      const appointments = await db.collection('appointments').find({}).toArray();
      res.json(appointments);
    } else {
      res.json(mockData.appointments);
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointments by date
app.get('/api/appointments/date/:date', async (req, res) => {
  const { date } = req.params;
  
  try {
    if (db) {
      const appointments = await db.collection('appointments').find({ date }).toArray();
      res.json(appointments);
    } else {
      const appointments = mockData.appointments.filter(a => a.date === date);
      res.json(appointments);
    }
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new appointment
app.post('/api/appointments', async (req, res) => {
  const appointmentData = req.body;
  const id = uuidv4();
  
  try {
    // Find patient details
    let patient;
    if (db) {
      patient = await db.collection('patients').findOne({ id: appointmentData.patientId });
    } else {
      patient = mockData.patients.find(p => p.id === appointmentData.patientId);
    }
    
    const newAppointment = {
      id,
      ...appointmentData,
      firstName: patient?.firstName || '',
      lastName: patient?.lastName || '',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    if (db) {
      await db.collection('appointments').insertOne(newAppointment);
    } else {
      mockData.appointments.push(newAppointment);
    }
    
    res.json({ id, message: 'Appointment created successfully' });
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment
app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const updateData = {
      ...req.body,
      updatedAt: new Date()
    };
    
    if (db) {
      const result = await db.collection('appointments').updateOne(
        { id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    } else {
      const appointmentIndex = mockData.appointments.findIndex(a => a.id === id);
      
      if (appointmentIndex === -1) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      mockData.appointments[appointmentIndex] = {
        ...mockData.appointments[appointmentIndex],
        ...updateData
      };
    }
    
    res.json({ message: 'Appointment updated successfully' });
  } catch (error) {
    console.error('Error updating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete appointment
app.delete('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (db) {
      const result = await db.collection('appointments').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    } else {
      const appointmentIndex = mockData.appointments.findIndex(a => a.id === id);
      
      if (appointmentIndex === -1) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      mockData.appointments.splice(appointmentIndex, 1);
    }
    
    res.json({ message: 'Appointment deleted successfully' });
  } catch (error) {
    console.error('Error deleting appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get dashboard statistics
app.get('/api/dashboard/stats', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    // Calculate start and end of current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);
    
    const dbConnected = await checkDatabaseConnection();
    
    let stats;
    
    if (dbConnected) {
      const [totalPatients, todaysAppointments, pendingAppointments, newPatientsThisMonth] = await Promise.all([
        db.collection('patients').countDocuments(),
        db.collection('appointments').countDocuments({ date: today }),
        db.collection('appointments').countDocuments({ status: 'pending' }),
        db.collection('patients').countDocuments({
          createdAt: {
            $gte: startOfMonth,
            $lte: endOfMonth
          }
        })
      ]);
      
      stats = {
        totalPatients,
        todaysAppointments,
        pendingAppointments,
        newPatientsThisMonth
      };
    } else {
      console.log('🔄 Using mock data for dashboard stats');
      
      // Calculate new patients this month from mock data
      const newPatientsThisMonth = mockData.patients.filter(patient => {
        if (!patient.createdAt) return false;
        const patientDate = new Date(patient.createdAt);
        return patientDate >= startOfMonth && patientDate <= endOfMonth;
      }).length;
      
      stats = {
        totalPatients: mockData.patients.length,
        todaysAppointments: mockData.appointments.filter(a => a.date === today).length,
        pendingAppointments: mockData.appointments.filter(a => a.status === 'pending').length,
        newPatientsThisMonth
      };
    }
    
    res.json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sync status endpoint - check if data is synchronized
app.get('/api/sync-status', async (req, res) => {
  try {
    const dbConnected = await checkDatabaseConnection();
    
    const syncInfo = {
      databaseConnected: dbConnected,
      isConnected: isConnected,
      timestamp: new Date().toISOString(),
      dataSource: dbConnected ? 'MongoDB' : 'Mock Data',
      connectionStatus: dbConnected ? 'Active' : 'Fallback to Mock Data'
    };
    
    if (dbConnected) {
      try {
        const patientsCount = await db.collection('patients').countDocuments();
        const appointmentsCount = await db.collection('appointments').countDocuments();
        
        syncInfo.patientsCount = patientsCount;
        syncInfo.appointmentsCount = appointmentsCount;
        syncInfo.lastSync = new Date().toISOString();
        syncInfo.databaseStatus = 'Healthy';
      } catch (dbError) {
        syncInfo.databaseError = dbError.message;
        syncInfo.databaseStatus = 'Error';
      }
    } else {
      syncInfo.patientsCount = mockData.patients.length;
      syncInfo.appointmentsCount = mockData.appointments.length;
      syncInfo.databaseStatus = 'Using Mock Data';
    }
    
    res.json(syncInfo);
  } catch (error) {
    console.error('Error checking sync status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm appointment
app.put('/api/appointments/:id/confirm', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (db) {
      const result = await db.collection('appointments').updateOne(
        { id },
        { $set: { status: 'confirmed', updatedAt: new Date() } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    } else {
      const appointmentIndex = mockData.appointments.findIndex(a => a.id === id);
      
      if (appointmentIndex === -1) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      mockData.appointments[appointmentIndex].status = 'confirmed';
      mockData.appointments[appointmentIndex].updatedAt = new Date();
    }
    
    res.json({ message: 'Appointment confirmed successfully' });
  } catch (error) {
    console.error('Error confirming appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Cancel appointment
app.put('/api/appointments/:id/cancel', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (db) {
      const result = await db.collection('appointments').updateOne(
        { id },
        { $set: { status: 'cancelled', updatedAt: new Date() } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    } else {
      const appointmentIndex = mockData.appointments.findIndex(a => a.id === id);
      
      if (appointmentIndex === -1) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      mockData.appointments[appointmentIndex].status = 'cancelled';
      mockData.appointments[appointmentIndex].updatedAt = new Date();
    }
    
    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    console.error('Error cancelling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reschedule appointment
app.put('/api/appointments/:id/reschedule', async (req, res) => {
  const { id } = req.params;
  const { newDate, newTime, reason, notifyPatient } = req.body;
  
  try {
    if (db) {
      const result = await db.collection('appointments').updateOne(
        { id },
        { 
          $set: { 
            date: newDate,
            startTime: newTime,
            rescheduleReason: reason,
            notifyPatient: notifyPatient,
            status: 'confirmed', // Auto-confirm after reschedule
            updatedAt: new Date()
          } 
        }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    } else {
      const appointmentIndex = mockData.appointments.findIndex(a => a.id === id);
      
      if (appointmentIndex === -1) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      mockData.appointments[appointmentIndex].date = newDate;
      mockData.appointments[appointmentIndex].startTime = newTime;
      mockData.appointments[appointmentIndex].rescheduleReason = reason;
      mockData.appointments[appointmentIndex].notifyPatient = notifyPatient;
      mockData.appointments[appointmentIndex].status = 'confirmed'; // Auto-confirm after reschedule
      mockData.appointments[appointmentIndex].updatedAt = new Date();
    }
    
    res.json({ message: 'Appointment rescheduled and confirmed successfully' });
  } catch (error) {
    console.error('Error rescheduling appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single appointment by ID
app.get('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    if (db) {
      const appointment = await db.collection('appointments').findOne({ id });
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      res.json(appointment);
    } else {
      const appointment = mockData.appointments.find(a => a.id === id);
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      res.json(appointment);
    }
  } catch (error) {
    console.error('Error fetching appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Clear all test data from database
app.post('/api/clear-test-data', async (req, res) => {
  try {
    if (db) {
      // Clear all test data
      await db.collection('appointments').deleteMany({});
      await db.collection('patients').deleteMany({});
      
      console.log('🗑️ All test data cleared from database');
      res.json({ message: 'All test data cleared successfully' });
    } else {
      // Clear mock data
      mockData.appointments = [];
      mockData.patients = [];
      
      console.log('🗑️ All test data cleared from mock data');
      res.json({ message: 'All test data cleared from mock data' });
    }
  } catch (error) {
    console.error('Error clearing test data:', error);
    res.status(500).json({ error: 'Failed to clear test data' });
  }
});

// Reset database with test data (for development only)
app.post('/api/reset-db', async (req, res) => {
  try {
    if (db) {
      // Clear existing data
      await db.collection('appointments').deleteMany({});
      await db.collection('patients').deleteMany({});
      
      // Reinitialize with fresh data
      await initializeCollections();
      
      res.json({ message: 'Database reset successfully' });
    } else {
      // Reset mock data
      mockData.appointments = [];
      mockData.patients = [];
      initializeMockData();
      
      res.json({ message: 'Mock data reset successfully' });
    }
  } catch (error) {
    console.error('Error resetting database:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Serve login page for unauthenticated users
app.get('/', (req, res) => {
  // Serve dashboard directly - no authentication required
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Serve the main HTML file for authenticated users
app.get('/dashboard', (req, res) => {
  // Serve dashboard directly - no authentication required
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
app.listen(PORT, async () => {
  console.log(`🚀 FillerMed Dashboard running on http://localhost:${PORT}`);
  
  // Try to connect to MongoDB
  await connectToMongoDB();
  
  console.log(`👩‍⚕️ Ready for receptionist use!`);
  console.log('Default login credentials:');
  console.log('Username: receptionist');
  console.log('Password: welcome123');
});

// Graceful shutdown
process.on('SIGINT', async () => {
  console.log('\n🛑 Shutting down server...');
  
  if (mongoClient) {
    try {
      await mongoClient.close();
      console.log('🔌 MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
  
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, shutting down gracefully...');
  
  if (mongoClient) {
    try {
      await mongoClient.close();
      console.log('🔌 MongoDB connection closed');
    } catch (error) {
      console.error('Error closing MongoDB connection:', error);
    }
  }
  
  process.exit(0);
});

// Export pentru Vercel
module.exports = app;