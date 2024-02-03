CREATE TABLE blogs (
  id SERIAL PRIMARY KEY,
  author text, 
  url text NOT NULL, 
  title text NOT NULL, 
  likes INTEGER DEFAULT 0
);

INSERT INTO blogs (author, url, title, likes) VALUES ('blogger', 'blog.com', 'Great Blog', 10);

INSERT INTO blogs (author, url, title, likes) VALUES ('girl123', 'myblog.com', 'My Blog', 1);
