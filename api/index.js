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
    
    // Initialize collections
    await initializeCollections();
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    console.log('🔄 Using mock data instead');
    isConnected = false;
  }
}

// Mock data for development
const mockData = {
  patients: [],
  appointments: []
};

// Initialize collections with sample data
async function initializeCollections() {
  try {
    if (db) {
      // Check if collections exist and create if needed
      const collections = await db.listCollections().toArray();
      const collectionNames = collections.map(c => c.name);
      
      if (!collectionNames.includes('patients')) {
        await db.createCollection('patients');
        console.log('📊 Patients collection created');
      }
      
      if (!collectionNames.includes('appointments')) {
        await db.createCollection('appointments');
        console.log('📅 Appointments collection created');
      }
      
      // Check if we have any data
      const patientCount = await db.collection('patients').countDocuments();
      const appointmentCount = await db.collection('appointments').countDocuments();
      
      console.log(`📊 Patients collection ready with ${patientCount} patients`);
      console.log(`📅 Appointments collection ready with ${appointmentCount} appointments`);
    } else {
      console.log('Mock data initialized');
    }
  } catch (error) {
    console.error('Error initializing collections:', error);
  }
}

// Database connection check
async function checkDatabaseConnection() {
  try {
    if (db) {
      await db.admin().ping();
      return true;
    }
    return false;
  } catch (error) {
    console.error('Database connection check failed:', error);
    return false;
  }
}

// API Routes
app.get('/api/auth/status', (req, res) => {
  if (req.session && req.session.userId) {
    res.json({ 
      authenticated: true, 
      userId: req.session.userId,
      username: req.session.username 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  console.log('🔐 Login endpoint called:', req.path);
  console.log('📝 Request body:', req.body);
  
  const { username, password } = req.body;
  
  // Simple authentication (in production, use proper authentication)
  if (username === 'receptionist' && password === 'welcome123') {
    req.session.userId = 'user-123';
    req.session.username = username;
    console.log('✅ Login successful for:', username);
    res.json({ 
      success: true, 
      message: 'Login successful',
      user: { id: 'user-123', username: username }
    });
  } else {
    console.log('❌ Login failed for:', username);
    res.status(401).json({ 
      success: false, 
      message: 'Invalid credentials' 
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      return res.status(500).json({ error: 'Could not log out' });
    }
    res.json({ message: 'Logged out successfully' });
  });
});

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

// Get single patient
app.get('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  
  try {
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const patient = await db.collection('patients').findOne({ id });
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json(patient);
    } else {
      console.log('🔄 Using mock data for patient');
      const patient = mockData.patients.find(p => p.id === id);
      
      if (!patient) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      res.json(patient);
    }
  } catch (error) {
    console.error('Error fetching patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new patient
app.post('/api/patients', async (req, res) => {
  try {
    const { firstName, lastName, email, phone, dateOfBirth, address, medicalHistory, allergies, emergencyContact } = req.body;
    
    const newPatient = {
      id: uuidv4(),
      firstName,
      lastName,
      email,
      phone,
      dateOfBirth,
      address,
      medicalHistory,
      allergies,
      emergencyContact,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      await db.collection('patients').insertOne(newPatient);
    } else {
      console.log('🔄 Using mock data for new patient');
      mockData.patients.push(newPatient);
    }
    
    res.status(201).json(newPatient);
  } catch (error) {
    console.error('Error creating patient:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update patient
app.put('/api/patients/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body, updatedAt: new Date() };
  
  try {
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const result = await db.collection('patients').updateOne(
        { id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }
    } else {
      console.log('🔄 Using mock data for patient update');
      const patientIndex = mockData.patients.findIndex(p => p.id === id);
      
      if (patientIndex === -1) {
        return res.status(404).json({ error: 'Patient not found' });
      }
      
      mockData.patients[patientIndex] = { ...mockData.patients[patientIndex], ...updateData };
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
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const result = await db.collection('patients').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Patient not found' });
      }
    } else {
      console.log('🔄 Using mock data for patient deletion');
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
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const appointments = await db.collection('appointments').find({}).toArray();
      res.json(appointments);
    } else {
      console.log('🔄 Using mock data for appointments');
      res.json(mockData.appointments);
    }
  } catch (error) {
    console.error('Error fetching appointments:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get appointments for specific date
app.get('/api/appointments/date/:date', async (req, res) => {
  const { date } = req.params;
  
  try {
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const appointments = await db.collection('appointments').find({ date }).toArray();
      res.json(appointments);
    } else {
      console.log('🔄 Using mock data for appointments by date');
      const appointments = mockData.appointments.filter(apt => apt.date === date);
      res.json(appointments);
    }
  } catch (error) {
    console.error('Error fetching appointments by date:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new appointment
app.post('/api/appointments', async (req, res) => {
  try {
    const { patientId, patientName, date, startTime, endTime, type, notes, status } = req.body;
    
    const newAppointment = {
      id: uuidv4(),
      patientId,
      patientName,
      date,
      startTime,
      endTime,
      type,
      notes,
      status: status || 'pending',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      await db.collection('appointments').insertOne(newAppointment);
    } else {
      console.log('🔄 Using mock data for new appointment');
      mockData.appointments.push(newAppointment);
    }
    
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error('Error creating appointment:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update appointment
app.put('/api/appointments/:id', async (req, res) => {
  const { id } = req.params;
  const updateData = { ...req.body, updatedAt: new Date() };
  
  try {
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const result = await db.collection('appointments').updateOne(
        { id },
        { $set: updateData }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    } else {
      console.log('🔄 Using mock data for appointment update');
      const appointmentIndex = mockData.appointments.findIndex(a => a.id === id);
      
      if (appointmentIndex === -1) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      mockData.appointments[appointmentIndex] = { ...mockData.appointments[appointmentIndex], ...updateData };
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
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const result = await db.collection('appointments').deleteOne({ id });
      
      if (result.deletedCount === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    } else {
      console.log('🔄 Using mock data for appointment deletion');
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

// Dashboard stats
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

// Database sync status
app.get('/api/sync-status', async (req, res) => {
  try {
    const dbConnected = await checkDatabaseConnection();
    
    res.json({
      connected: dbConnected,
      database: dbConnected ? 'MongoDB Atlas' : 'Mock Data',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking sync status:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Confirm appointment
app.put('/api/appointments/:id/confirm', async (req, res) => {
  const { id } = req.params;
  
  try {
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const result = await db.collection('appointments').updateOne(
        { id },
        { $set: { status: 'confirmed', updatedAt: new Date() } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    } else {
      console.log('🔄 Using mock data for appointment confirmation');
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
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const result = await db.collection('appointments').updateOne(
        { id },
        { $set: { status: 'cancelled', updatedAt: new Date() } }
      );
      
      if (result.matchedCount === 0) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
    } else {
      console.log('🔄 Using mock data for appointment cancellation');
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
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
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
      console.log('🔄 Using mock data for appointment reschedule');
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
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      const appointment = await db.collection('appointments').findOne({ id });
      
      if (!appointment) {
        return res.status(404).json({ error: 'Appointment not found' });
      }
      
      res.json(appointment);
    } else {
      console.log('🔄 Using mock data for single appointment');
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
    const dbConnected = await checkDatabaseConnection();
    
    if (dbConnected) {
      // Clear all test data
      await db.collection('appointments').deleteMany({});
      await db.collection('patients').deleteMany({});
      
      res.json({ message: 'All test data cleared from database' });
    } else {
      // Clear mock data
      mockData.patients = [];
      mockData.appointments = [];
      
      res.json({ message: 'All test data cleared from mock data' });
    }
  } catch (error) {
    console.error('Error clearing test data:', error);
    res.status(500).json({ error: 'Failed to reset database' });
  }
});

// Serve all HTML pages
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/dashboard', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/login.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../login.html'));
});

app.get('/patients', (req, res) => {
  res.sendFile(path.join(__dirname, '../patients.html'));
});

app.get('/patients.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../patients.html'));
});

app.get('/appointments', (req, res) => {
  res.sendFile(path.join(__dirname, '../appointments.html'));
});

app.get('/appointments.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../appointments.html'));
});

app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, '../reports.html'));
});

app.get('/reports.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../reports.html'));
});

app.get('/patients-simple', (req, res) => {
  res.sendFile(path.join(__dirname, '../patients-simple.html'));
});

app.get('/patients-simple.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../patients-simple.html'));
});

app.get('/index.html', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html'));
});

// Serve static files
app.get('/assets/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

// Serve CSS files
app.get('*.css', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

// Serve specific CSS files
app.get('/assets/css/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

// Serve JS files
app.get('*.js', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

// Serve specific JS files
app.get('/assets/js/*', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

// Serve image files
app.get('*.png', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

app.get('*.jpg', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

app.get('*.jpeg', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

app.get('*.gif', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

app.get('*.svg', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

app.get('*.ico', (req, res) => {
  res.sendFile(path.join(__dirname, '..', req.path));
});

// Catch-all route for GET requests (but not API routes)
app.get('*', (req, res) => {
  // Skip API routes
  if (req.path.startsWith('/api/')) {
    return res.status(404).json({ error: 'API endpoint not found' });
  }
  
  // If it's an HTML file request, serve it
  if (req.path.endsWith('.html')) {
    const fileName = req.path.substring(1); // Remove leading slash
    res.sendFile(path.join(__dirname, '..', fileName));
  } else {
    // For other requests, serve index.html
    res.sendFile(path.join(__dirname, '../index.html'));
  }
});

// Initialize database connection
connectToMongoDB();

module.exports = app;
