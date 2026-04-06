const path = require("path");
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
dotenv.config({ path: path.join(__dirname, '.env') });
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
require('./setup/db');

const app = express();
const passport = require('passport');
const __dirname = path.resolve()

app.use(express.static(path.join(__dirname,"../client/build")));

    app.get("*",(req,res)=>{
        res.sendFile(path.join(__dirname,"../client","build","index.html"))
    });

app.setNotFoundHandler((request, reply) => {
    if (request.raw.url.startsWith('/api')) {
        return reply.code(404).send({
            success: false,
            message: 'API route not found'
        });
    }

    // SPA fallback
    return reply.sendFile('index.html');
});

require('./setup/passport');

// Security Headers with CSP bypass for Cloudinary
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            ...helmet.contentSecurityPolicy.getDefaultDirectives(),
            "img-src": ["'self'", "data:", "res.cloudinary.com"],
            "script-src": ["'self'", "'unsafe-inline'"],
            "connect-src": ["'self'", "res.cloudinary.com", process.env.FRONTEND_URL || "*"]
        },
    },
}));

app.use(compression());
app.use(express.json());

// Production CORS Configuration
const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:3000';
app.use(cors({
    origin: allowedOrigin,
    credentials: true
}));

app.use(passport.initialize());

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200, // Slightly increased for production
    message: 'Too many requests from this IP'
});
app.use('/api/', limiter);

// API Routes
const authRoutes = require('./routes/authRoutes');
const subjectRoutes = require('./routes/subjectRoutes');
const userRoutes = require('./routes/userRoutes');
const assignmentRoutes = require('./routes/assignmentRoutes');
const submissionRoutes = require('./routes/submissionRoutes');
const reportRoutes = require('./routes/reportRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/subjects', subjectRoutes);
app.use('/api/users', userRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/submissions', submissionRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Static Asset Serving in Production
if (process.env.NODE_ENV === 'production') {
    const clientBuildPath = path.join(__dirname, '..', 'client', 'build');
    app.use(express.static(clientBuildPath));

    app.get('(.*)', (req, res) => {
        if (!req.path.startsWith('/api')) {
            res.sendFile(path.join(clientBuildPath, 'index.html'));
        }
    });
} else {
    app.get('/', (req, res) => {
        res.send('OAES API is running in development mode...');
    });
}

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(err.status || 500).json({
        message: err.message || 'Internal Server Error',
        error: process.env.NODE_ENV === 'development' ? err : {}
    });
});

const http = require('http');
const server = http.createServer(app);
const socketSetup = require('./setup/socket');
socketSetup.init(server);

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
