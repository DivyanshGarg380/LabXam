import { QuestionsPage } from "@/components/QuestionsPage";

// Demo page showing the empty state
const EmptyDemo = () => {
  return (
    <QuestionsPage
      semester="Semester 4"
      subject="Operating Systems (OS)"
      evaluationType="Endsem"
      section="Section B"
      date="Jan 2025"
      questions={[]}
    />
  );
};

export default EmptyDemo;
