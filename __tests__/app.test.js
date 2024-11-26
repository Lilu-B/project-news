const db = require('../db/connection');
const endpointsJson = require("../endpoints.json");
const testData = require("../db/data/test-data");
const seed = require("../db/seeds/seed");
const request = require('supertest');
const app = require('../app');



beforeEach( () => {
  return seed(testData);
});

afterAll( () => {
  return db.end();
});


describe("GET /api", () => {
  test("200: Responds with an object detailing the documentation for each endpoint", () => {
    return request(app)
      .get("/api")
      .expect(200)
      .then(({ body: { endpoints } }) => {
        expect(endpoints).toEqual(endpointsJson);
      });
  });
  test("404: Responds with a 404 error for a non-existent endpoint", () => {
    return request(app)
      .get("/api/non-existent-endpoint")
      .expect(404)
      .then(({ body }) => {
        expect(body.msg).toBe("Not Found");
      });
  });
});

describe("GET /api/topics", () => {
  test("200: Responds with an array of topic objects", () => {
    return request(app)
      .get("/api/topics")
      .expect(200)
      .then(({ body: { topics } }) => {
        expect(topics).toBeInstanceOf(Array);
        expect(topics).not.toHaveLength(0);
        
        topics.forEach(topic => {
          expect(topic).toHaveProperty("slug");
          expect(topic).toHaveProperty("description");
        });
      });
  });
});

describe('GET /api/articles', () => {
  test('200: Responds with an array of article objects, each with the following properties', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body: { articles } }) => {
        expect(articles).toBeInstanceOf(Array);
        expect(articles).not.toHaveLength(0);
    
      articles.forEach((article) => {
        expect(article).toEqual({
          author: expect.any(String),
          title: expect.any(String),
          article_id: expect.any(Number),
          topic: expect.any(String),
          created_at: expect.any(String),
          votes: expect.any(Number),
          article_img_url: expect.any(String),
          comment_count: expect.any(Number),
        });
      });
      });
  });

  test('200: Responds with an array of article objects without a BODY property', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
        const { articles } = body;
        articles.forEach((article) => {
          expect(article).not.toHaveProperty('body');
        });
      });
  });
  
  test('200: Responds with articles are sorted in descending order', () => {
    return request(app)
      .get('/api/articles')
      .expect(200)
      .then(({ body }) => {
          const { articles } = body;
          expect(articles).toBeSortedBy('created_at', { descending: true });
      });
  });
});

describe('GET /api/articles/:article_id', () => {
  test('200: Responds with the article object, which should have the following properties', () => {
      return request(app)
          .get('/api/articles/1')
          .expect(200)
          .then(({ body: { article } }) => {
              expect(article).toEqual(
                  expect.objectContaining({
                      author: expect.any(String),
                      title: expect.any(String),
                      article_id: 1,
                      body: expect.any(String),
                      topic: expect.any(String),
                      created_at: expect.any(String),
                      votes: expect.any(Number),
                      article_img_url: expect.any(String),
                  })
              );
          });
  });
  test('400: Responds with "Invalid article_id" for NaN', () => {
    return request(app)
        .get('/api/articles/not-a-number')
        .expect(400)
        .then(({ body: { msg } }) => {
            expect(msg).toBe('Invalid article_id');
        });
  });
});

describe('GET /api/articles/:article_id/comments', () => {
  test('200: Responds - each comment should have the correct structure', () => {
    const article_id = 1; 
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        comments.forEach((comment) => {
          expect(comment).toEqual(
            expect.objectContaining({
              comment_id: expect.any(Number),
              votes: expect.any(Number),
              created_at: expect.any(String),
              author: expect.any(String),
              body: expect.any(String),
              article_id: article_id, 
            })
          );
        });
      });
  });
  test('200: Responds with an array of comments for article_id + msg if there no comments', () => {
    const article_id = 0;
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(Array.isArray(comments)).toBe(true); 
        expect(comments).toHaveLength(0); 
      });
  });
  test('200: Responds with the comments in the correct order (last is first)', () => {
    const article_id = 1; 
    return request(app)
      .get(`/api/articles/${article_id}/comments`)
      .expect(200)
      .then(({ body: { comments } }) => {
        expect(comments[0].comment_id).toBeGreaterThan(comments[1].comment_id); 
      });
  });
});
