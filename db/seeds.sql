USE employee_db;

INSERT INTO department (departmentName) 
VALUES ('Sales'),
       ('Marketing'),
       ('Customer Service'),
       ('Engineering');

INSERT INTO role (title, salary, departmentID)
VALUES ('Sales Representative', 65000, 1),
       ('Lead Sales Manager', 95000, 1), 
       ('Sales Intern', 45000, 1),

       ('Lead Marketing Manager', 110000, 2),
       ('Social Media Marketing Agent', 65000, 2),
       ('Marketing Agent', 70000, 2),
       ('Marketing Intern', 45000, 2),

       ('Customer Service Manager', 110000, 3),
       ('Customer Service Representative', 70000, 3),
       ('Customer Service Intern', 50000, 3),

       ('Lead Developer', 135000, 4),
       ('Software Engineer', 110000, 4),
       ('Senior Developer', 110000, 4),
       ('Jr. Software Engineer', 75000, 4),
       ('Software Engineering Intern', 45000, 4);

INSERT INTO employee (firstName, lastName, roleID, managerID)
VALUES ('Ricky', 'Ahmed', 2, 0),
       ('Rakib', 'Ahmed', 1, 1),
       ('Sanad', 'Ahmed', 3, 1),
       ('Sanad', 'Uddin', 3, 1),

       ('Mark', 'Not', 4, 0),
       ('Andy', 'Toys', 5, 5),
       ('Disney', 'Princess', 7, 5),
       ('Geralt', 'Rivia', 6, 5),
       ('Maggie', 'Glenn', 6, 5),

       ('Mario', 'Luigi', 8, 0),
       ('Monkey', 'Luffy', 10, 10),
       ('Roronoa', 'Zoro', 9, 10),
       ('Vinsmoke', 'Sanji', 9, 10),

       ('Justin', 'Case', 11, 0),
       ('Shohan', 'Ahmed', 12, 14),
       ('Dwayne', 'Wade', 13, 14),
       ('Brandy', 'Woods', 14, 14),
       ('Jarvis', 'Marvel', 15, 14);