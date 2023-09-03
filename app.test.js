const request = require('supertest');
const app = require('./app');

describe('Test GET /messages endpoint', () => {
  test('It should return the messages array', async () => {
    // Send a POST request to the /messages route with a message object in the request body
    const response = await request(app)
      .get('/messages');
     expect_or(
        () => expect(response.statusCode).toBe(200),
        () => expect(response.statusCode).toBe(201)
      );
    expect(response.body).toBeDefined();
  });
});

describe('Test POST /messages endpoint', () => {
  test('It should create a new message in the messages array', async () => {
    // Send a POST request to the /messages route with a message object in the request body
    const response = await request(app)
      .post('/messages')
      .send({ from: 'Alice', text: 'Hello, how are you?' });
     expect_or(
        () => expect(response.statusCode).toBe(200),
        () => expect(response.statusCode).toBe(201)
      );
    expect(response.body).toBeDefined();
    expect(typeof response.body.id).toBe('number');
    expect(response.body.from).toEqual('Alice');
    expect(response.body.text).toEqual('Hello, how are you?');

    // Load the updated messages json object
    const messages = await request(app)
      .get('/messages');
    // Check that the last element of the messages array is the new message
    expect(messages.body[messages.body.length-1]).toMatchObject({ id: response.body.id, from: 'Alice', text: 'Hello, how are you?' });
  });
});

describe('Test GET /messages/:id endpoint', () => {
  test('It should return a message with the matching id', async () => {
    // Load the messages.json file
    const messages = await request(app).get('/messages');
    // Get the first message from the array
    const message = messages.body[0];

    // Send a GET request to the /messages/:id route with the message's id in the route parameter
    const response = await request(app).get(`/messages/${message.id}`);
     expect_or(
        () => expect(response.statusCode).toBe(200),
        () => expect(response.statusCode).toBe(201)
      );
    expect(response.body).toBeDefined();
    expect(response.body).toEqual(message);
  });

  test('It should return a 404 or 400 response if no message with the matching id was found', async () => {
    // Send a GET request to the /messages/:id route with a non-existent id in the route parameter
    const response = await request(app).get('/messages/12345');
     expect_or(
        () => expect(response.statusCode).toBe(400),
        () => expect(response.statusCode).toBe(404)
      );
  });
});

describe('Test DELETE /messages/:id endpoint', () => {
  test('It should delete a message with the matching id', async () => {
    // Load the messages.json file
    const messages = await request(app).get('/messages');
    // Get the first message from the array
    const message = messages.body[0];

    // Send a DELETE request to the /messages/:id route with the message's id in the route parameter
    const response = await request(app).delete(`/messages/${message.id}`);
     expect_or(
        () => expect(response.statusCode).toBe(200),
        () => expect(response.statusCode).toBe(201)
      );

    // Load the updated messages.json file
    const updatedMessages = await request(app).get('/messages');
    // Check that the messages array no longer contains the deleted message
    expect(updatedMessages.body).not.toContainEqual(message);
  });

  test('It should return a 400 or 404 response if no message with the matching id was found', async () => {
    // Send a DELETE request to the /messages/:id route with a non-existent id in the route parameter
    const response = await request(app).delete('/messages/12345');
     expect_or(
        () => expect(response.statusCode).toBe(400),
        () => expect(response.statusCode).toBe(404)
      );
  });
});

describe('Test POST /messages endpoint - validation', () => {
  test('It should return 400 or 404 if the author or the text of the message is empty', async () => {
    // Send a POST request to the /messages route with a message containing empty from
    const response1 = await request(app)
      .post('/messages')
      .send({ from: '', text: 'Hello, how are you?' });
     expect_or(
        () => expect(response1.statusCode).toBe(400),
        () => expect(response1.statusCode).toBe(404)
      );
      // Send a POST request to the /messages route with a message containing empty text
    const response2 = await request(app)
      .post('/messages')
      .send({ from: 'Alice', text: '' });
         expect_or(
          () => expect(response2.statusCode).toBe(400),
          () => expect(response2.statusCode).toBe(404)
      );
  });
});

function expect_or(...tests) {
  try {
    tests.shift()();
  } catch(e) {
    if (tests.length) expect_or(...tests);
    else throw e;
  }
}