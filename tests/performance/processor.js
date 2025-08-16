/**
 * Artillery processor for custom functions and data generation
 * Provides utilities for load testing scenarios
 */

const crypto = require('crypto');

module.exports = {
  // Generate random string for unique identifiers
  generateRandomString,
  
  // Generate test user data
  generateTestUser,
  
  // Generate random AI message
  generateRandomMessage,
  
  // Custom response validation
  validateResponse,
  
  // Setup phase - runs before tests
  setupPhase,
  
  // Teardown phase - runs after tests
  teardownPhase,
};

/**
 * Generate random string of specified length
 */
function generateRandomString(length = 8) {
  return crypto.randomBytes(length).toString('hex').substring(0, length);
}

/**
 * Generate test user data
 */
function generateTestUser(context, events, done) {
  const userId = generateRandomString(8);
  
  context.vars.testUser = {
    email: `loadtest_${userId}@example.com`,
    password: 'LoadTest123!',
    firstName: `Load${userId}`,
    lastName: 'Test',
    role: ['student', 'teacher'][Math.floor(Math.random() * 2)],
  };
  
  return done();
}

/**
 * Generate random AI message for testing
 */
function generateRandomMessage(context, events, done) {
  const messages = [
    'What is the capital of France?',
    'Explain photosynthesis in simple terms',
    'How do I solve quadratic equations?',
    'What are the benefits of renewable energy?',
    'Can you help me with my homework?',
    'Tell me about the solar system',
    'What is machine learning?',
    'How does the internet work?',
    'Explain the water cycle',
    'What causes climate change?',
  ];
  
  context.vars.randomMessage = messages[Math.floor(Math.random() * messages.length)];
  return done();
}

/**
 * Validate API response structure and content
 */
function validateResponse(requestParams, response, context, events, done) {
  // Check response time
  if (response.timings.response > 5000) {
    events.emit('counter', 'slow_response', 1);
  }
  
  // Check for successful responses
  if (response.statusCode >= 200 && response.statusCode < 300) {
    events.emit('counter', 'successful_response', 1);
  } else {
    events.emit('counter', 'failed_response', 1);
    console.error(`Request failed: ${response.statusCode} - ${response.body}`);
  }
  
  // Validate JSON response structure for API endpoints
  if (requestParams.url.includes('/api/')) {
    try {
      const data = JSON.parse(response.body);
      
      // Check for expected response structure
      if (data.success !== undefined) {
        events.emit('counter', 'valid_api_response', 1);
      } else {
        events.emit('counter', 'invalid_api_response', 1);
      }
      
      // Check for error responses
      if (data.success === false && data.error) {
        events.emit('counter', 'api_error_response', 1);
        console.warn(`API Error: ${data.error}`);
      }
      
    } catch (error) {
      events.emit('counter', 'json_parse_error', 1);
      console.error('Failed to parse JSON response:', error.message);
    }
  }
  
  return done();
}

/**
 * Setup phase - prepare test environment
 */
function setupPhase(context, events, done) {
  console.log('🚀 Starting load test setup...');
  
  // Initialize counters
  events.emit('counter', 'test_setup_complete', 1);
  
  // Set global test start time
  context.vars.testStartTime = Date.now();
  
  console.log('✅ Load test setup complete');
  return done();
}

/**
 * Teardown phase - cleanup after tests
 */
function teardownPhase(context, events, done) {
  console.log('🧹 Starting load test teardown...');
  
  // Calculate total test duration
  const testDuration = Date.now() - context.vars.testStartTime;
  console.log(`Total test duration: ${testDuration}ms`);
  
  events.emit('counter', 'test_teardown_complete', 1);
  
  console.log('✅ Load test teardown complete');
  return done();
}

/**
 * Custom think time based on user behavior patterns
 */
function customThinkTime(context, events, done) {
  // Simulate realistic user behavior with variable think times
  const thinkTimes = {
    reading: () => Math.random() * 3000 + 2000, // 2-5 seconds
    typing: () => Math.random() * 2000 + 1000,  // 1-3 seconds
    clicking: () => Math.random() * 1000 + 500, // 0.5-1.5 seconds
  };
  
  const action = ['reading', 'typing', 'clicking'][Math.floor(Math.random() * 3)];
  const delay = thinkTimes[action]();
  
  setTimeout(() => {
    events.emit('counter', `think_time_${action}`, 1);
    return done();
  }, delay);
}

/**
 * Simulate realistic user session patterns
 */
function simulateUserSession(context, events, done) {
  // Define session patterns
  const sessionTypes = {
    quick: { duration: 60000, actions: 3 },      // 1 minute, 3 actions
    normal: { duration: 300000, actions: 10 },   // 5 minutes, 10 actions
    extended: { duration: 900000, actions: 25 }, // 15 minutes, 25 actions
  };
  
  const sessionType = Object.keys(sessionTypes)[Math.floor(Math.random() * 3)];
  const session = sessionTypes[sessionType];
  
  context.vars.sessionType = sessionType;
  context.vars.sessionDuration = session.duration;
  context.vars.sessionActions = session.actions;
  
  events.emit('counter', `session_type_${sessionType}`, 1);
  
  return done();
}

/**
 * Monitor memory usage during tests
 */
function monitorMemoryUsage(context, events, done) {
  const memUsage = process.memoryUsage();
  
  // Emit memory metrics
  events.emit('histogram', 'memory_heap_used', memUsage.heapUsed);
  events.emit('histogram', 'memory_heap_total', memUsage.heapTotal);
  events.emit('histogram', 'memory_rss', memUsage.rss);
  
  // Warn if memory usage is high
  if (memUsage.heapUsed > 100 * 1024 * 1024) { // 100MB
    events.emit('counter', 'high_memory_usage', 1);
    console.warn(`High memory usage detected: ${Math.round(memUsage.heapUsed / 1024 / 1024)}MB`);
  }
  
  return done();
}

/**
 * Generate realistic error scenarios for testing error handling
 */
function generateErrorScenario(context, events, done) {
  const errorScenarios = [
    'network_timeout',
    'server_error',
    'rate_limit',
    'authentication_failure',
    'validation_error',
  ];
  
  // 10% chance of triggering an error scenario
  if (Math.random() < 0.1) {
    const scenario = errorScenarios[Math.floor(Math.random() * errorScenarios.length)];
    context.vars.errorScenario = scenario;
    events.emit('counter', `error_scenario_${scenario}`, 1);
  }
  
  return done();
}