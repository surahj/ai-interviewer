-- Seed data for the AI Interviewer application

-- Insert sample questions for different roles and levels
INSERT INTO questions (role, level, question, type, category, difficulty, tags) VALUES
-- Software Engineer - Junior Level
('software-engineer', 'junior', 'Can you explain the difference between synchronous and asynchronous programming?', 'technical', 'technical', 2, ARRAY['programming', 'async', 'basics']),
('software-engineer', 'junior', 'What is the difference between a stack and a queue?', 'technical', 'technical', 2, ARRAY['data-structures', 'algorithms']),
('software-engineer', 'junior', 'How would you implement a simple linked list?', 'technical', 'technical', 3, ARRAY['data-structures', 'algorithms']),
('software-engineer', 'junior', 'Explain the concept of recursion and provide an example.', 'technical', 'technical', 3, ARRAY['recursion', 'algorithms']),
('software-engineer', 'junior', 'What are the advantages and disadvantages of using a linked list versus an array?', 'technical', 'technical', 3, ARRAY['data-structures', 'comparison']),

-- Software Engineer - Mid Level
('software-engineer', 'mid-level', 'How would you design a URL shortening service?', 'technical', 'problem-solving', 4, ARRAY['system-design', 'scalability']),
('software-engineer', 'mid-level', 'Explain the concept of Big O notation and why it''s important.', 'technical', 'technical', 3, ARRAY['algorithms', 'complexity']),
('software-engineer', 'mid-level', 'What is dependency injection and how would you implement it?', 'technical', 'technical', 4, ARRAY['design-patterns', 'architecture']),
('software-engineer', 'mid-level', 'How would you handle memory leaks in a JavaScript application?', 'technical', 'technical', 4, ARRAY['javascript', 'memory-management']),
('software-engineer', 'mid-level', 'Explain the concept of closures in JavaScript.', 'technical', 'technical', 3, ARRAY['javascript', 'closures']),

-- Software Engineer - Senior Level
('software-engineer', 'senior', 'How would you design a system to handle millions of concurrent users?', 'technical', 'problem-solving', 5, ARRAY['system-design', 'scalability', 'architecture']),
('software-engineer', 'senior', 'Design a parking lot management system.', 'technical', 'problem-solving', 4, ARRAY['system-design', 'object-oriented']),
('software-engineer', 'senior', 'How would you implement a rate limiting system?', 'technical', 'problem-solving', 4, ARRAY['system-design', 'security']),
('software-engineer', 'senior', 'Design a notification system for a social media platform.', 'technical', 'problem-solving', 5, ARRAY['system-design', 'real-time']),
('software-engineer', 'senior', 'How would you optimize a slow database query?', 'technical', 'technical', 4, ARRAY['database', 'optimization']),

-- Frontend Developer - Junior Level
('frontend-developer', 'junior', 'Explain the difference between React hooks and class components.', 'technical', 'technical', 2, ARRAY['react', 'hooks']),
('frontend-developer', 'junior', 'What is the virtual DOM and how does it work?', 'technical', 'technical', 3, ARRAY['react', 'virtual-dom']),
('frontend-developer', 'junior', 'How would you optimize the performance of a React application?', 'technical', 'technical', 3, ARRAY['react', 'performance']),
('frontend-developer', 'junior', 'Explain the concept of CSS Grid versus Flexbox.', 'technical', 'technical', 2, ARRAY['css', 'layout']),
('frontend-developer', 'junior', 'What are the benefits of using TypeScript over JavaScript?', 'technical', 'technical', 2, ARRAY['typescript', 'javascript']),

-- Frontend Developer - Mid Level
('frontend-developer', 'mid-level', 'How would you implement state management in a large React application?', 'technical', 'technical', 4, ARRAY['react', 'state-management']),
('frontend-developer', 'mid-level', 'Explain the concept of progressive web apps.', 'technical', 'technical', 3, ARRAY['pwa', 'web-apps']),
('frontend-developer', 'mid-level', 'How would you handle responsive design for different screen sizes?', 'technical', 'technical', 3, ARRAY['responsive-design', 'css']),
('frontend-developer', 'mid-level', 'What is the difference between client-side and server-side rendering?', 'technical', 'technical', 3, ARRAY['rendering', 'performance']),
('frontend-developer', 'mid-level', 'How would you implement accessibility features in a web application?', 'technical', 'technical', 3, ARRAY['accessibility', 'a11y']),

-- Frontend Developer - Senior Level
('frontend-developer', 'senior', 'How would you implement infinite scrolling?', 'technical', 'problem-solving', 4, ARRAY['performance', 'user-experience']),
('frontend-developer', 'senior', 'Design a drag-and-drop interface.', 'technical', 'problem-solving', 4, ARRAY['user-interface', 'interaction']),
('frontend-developer', 'senior', 'How would you implement real-time updates in a web application?', 'technical', 'problem-solving', 4, ARRAY['real-time', 'websockets']),
('frontend-developer', 'senior', 'Design a search interface with autocomplete.', 'technical', 'problem-solving', 4, ARRAY['search', 'user-experience']),
('frontend-developer', 'senior', 'How would you implement offline functionality?', 'technical', 'problem-solving', 4, ARRAY['offline', 'pwa']),

-- Data Scientist - Junior Level
('data-scientist', 'junior', 'What is the difference between supervised and unsupervised learning?', 'technical', 'technical', 2, ARRAY['machine-learning', 'basics']),
('data-scientist', 'junior', 'Explain the concept of overfitting and how to prevent it.', 'technical', 'technical', 3, ARRAY['machine-learning', 'overfitting']),
('data-scientist', 'junior', 'What is cross-validation and why is it important?', 'technical', 'technical', 3, ARRAY['machine-learning', 'validation']),
('data-scientist', 'junior', 'How would you handle missing data in a dataset?', 'technical', 'technical', 3, ARRAY['data-preprocessing', 'missing-data']),
('data-scientist', 'junior', 'What is the difference between correlation and causation?', 'technical', 'technical', 2, ARRAY['statistics', 'correlation']),

-- Data Scientist - Mid Level
('data-scientist', 'mid-level', 'How would you evaluate the performance of a classification model?', 'technical', 'technical', 4, ARRAY['machine-learning', 'evaluation']),
('data-scientist', 'mid-level', 'Explain the concept of feature engineering and provide examples.', 'technical', 'technical', 4, ARRAY['feature-engineering', 'machine-learning']),
('data-scientist', 'mid-level', 'How would you handle imbalanced datasets?', 'technical', 'technical', 4, ARRAY['machine-learning', 'imbalanced-data']),
('data-scientist', 'mid-level', 'What is the difference between bagging and boosting?', 'technical', 'technical', 4, ARRAY['ensemble-methods', 'machine-learning']),
('data-scientist', 'mid-level', 'How would you implement a recommendation system?', 'technical', 'problem-solving', 4, ARRAY['recommendation-systems', 'machine-learning']),

-- Data Scientist - Senior Level
('data-scientist', 'senior', 'How would you design an A/B testing framework?', 'technical', 'problem-solving', 5, ARRAY['a-b-testing', 'experimentation']),
('data-scientist', 'senior', 'Design a real-time fraud detection system.', 'technical', 'problem-solving', 5, ARRAY['fraud-detection', 'real-time']),
('data-scientist', 'senior', 'How would you scale a machine learning pipeline?', 'technical', 'problem-solving', 5, ARRAY['mlops', 'scalability']),
('data-scientist', 'senior', 'Explain the concept of model interpretability and its importance.', 'technical', 'technical', 4, ARRAY['interpretability', 'ethics']),
('data-scientist', 'senior', 'How would you handle data drift in production models?', 'technical', 'technical', 5, ARRAY['mlops', 'data-drift']),

-- Behavioral Questions (for all roles and levels)
('software-engineer', 'junior', 'Tell me about a time when you had to learn a new technology quickly.', 'behavioral', 'behavioral', 2, ARRAY['learning', 'adaptability']),
('software-engineer', 'mid-level', 'Describe a situation where you had to debug a complex issue.', 'behavioral', 'behavioral', 3, ARRAY['problem-solving', 'debugging']),
('software-engineer', 'senior', 'Tell me about a time when you had to mentor a junior developer.', 'behavioral', 'behavioral', 4, ARRAY['leadership', 'mentoring']),
('frontend-developer', 'junior', 'How do you stay updated with frontend frameworks and libraries?', 'behavioral', 'behavioral', 2, ARRAY['learning', 'continuous-improvement']),
('frontend-developer', 'mid-level', 'Tell me about a project where you had to implement complex animations.', 'behavioral', 'behavioral', 3, ARRAY['project-management', 'technical-challenge']),
('frontend-developer', 'senior', 'How do you handle user experience feedback?', 'behavioral', 'behavioral', 4, ARRAY['user-experience', 'feedback']),
('data-scientist', 'junior', 'Describe a time when you had to explain a complex statistical concept to a non-technical audience.', 'behavioral', 'behavioral', 3, ARRAY['communication', 'statistics']),
('data-scientist', 'mid-level', 'Tell me about a data analysis project that had a significant business impact.', 'behavioral', 'behavioral', 4, ARRAY['business-impact', 'data-analysis']),
('data-scientist', 'senior', 'How do you approach ethical considerations in machine learning projects?', 'behavioral', 'behavioral', 5, ARRAY['ethics', 'responsible-ai']),

-- Problem Solving Questions
('software-engineer', 'junior', 'How would you implement a simple calculator?', 'technical', 'problem-solving', 2, ARRAY['algorithms', 'basic-programming']),
('software-engineer', 'mid-level', 'Design a file sharing system like Dropbox.', 'technical', 'problem-solving', 4, ARRAY['system-design', 'file-storage']),
('software-engineer', 'senior', 'How would you handle data consistency in a distributed system?', 'technical', 'problem-solving', 5, ARRAY['distributed-systems', 'consistency']),
('frontend-developer', 'junior', 'How would you implement a simple todo list?', 'technical', 'problem-solving', 2, ARRAY['react', 'basic-app']),
('frontend-developer', 'mid-level', 'Design a multi-step form with validation.', 'technical', 'problem-solving', 4, ARRAY['forms', 'validation']),
('frontend-developer', 'senior', 'How would you implement a file upload system with progress?', 'technical', 'problem-solving', 4, ARRAY['file-upload', 'user-experience']),
('data-scientist', 'junior', 'How would you analyze customer churn data?', 'technical', 'problem-solving', 3, ARRAY['data-analysis', 'customer-analytics']),
('data-scientist', 'mid-level', 'Design a customer segmentation model.', 'technical', 'problem-solving', 4, ARRAY['clustering', 'customer-analytics']),
('data-scientist', 'senior', 'How would you build a real-time recommendation engine?', 'technical', 'problem-solving', 5, ARRAY['recommendation-systems', 'real-time']);

-- Insert sample user profiles (these will be created automatically when users sign up)
-- Note: In a real application, user profiles are created via triggers or application logic
