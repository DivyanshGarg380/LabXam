import { QuestionsPage } from "@/components/QuestionsPage";

// Demo page showing the questions list with sample data
const sampleQuestions = [
  "Write a PL/SQL block to find the factorial of a given number using a loop. Include proper exception handling.",
  "Create a trigger that automatically updates the 'last_modified' column whenever a row in the 'employees' table is updated.",
  "Write a stored procedure to transfer funds between two accounts, ensuring atomicity using transactions.",
  "Explain the difference between implicit and explicit cursors in PL/SQL with examples.",
  "Design a database schema for a library management system with at least 5 tables and proper normalization.",
  "Write a function that returns the total salary of employees in a given department. Handle the case when department doesn't exist.",
];

const QuestionsDemo = () => {
  return (
    <QuestionsPage
      semester="Semester 3"
      subject="Database Management Systems (DBMS)"
      evaluationType="Midsem"
      section="Section A"
      date="Dec 2024"
      questions={sampleQuestions}
    />
  );
};

export default QuestionsDemo;
