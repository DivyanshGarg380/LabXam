export type EvaluationType = "Midsem" | "Internal Evaluation 1" | "Internal Evaluation 2" | "Endsem";

export interface QuestionSet {
  section: string;
  year: string;
  questions: string[];
}

export type SubjectQuestions = Partial<
  Record<EvaluationType, Record<string, Omit<QuestionSet, "section">>>
>;


export type SemesterQuestions = Record<string, SubjectQuestions>;

export type QuestionsDB = Record<string, SemesterQuestions>;

export const questionsDB: QuestionsDB = {
  "Semester 4": {
    osdl: {
      Midsem: {
        "IT-D": {
          year: "2026",
          questions: [
            "There is a cricket game scenario. Construct an enum Shot with fields as One, Two, Four, Six, Out. There is a CricketPlayer class which implements an interface with three methods (run, appeal, umpireDecision). If a player isn't out (OUT from enum -> pass 0), add scores of that player. If he is out, display the total runs he made and print OUT. The bowler can take an appeal and ask the umpire to check (basic check if boolean isOut = true). Three threads must operate. Implement everything in a menu-driven program.",
          ],
        },

        "CCE-D": {
          year: "2026",
          questions: [
            "Design and implement a Java-based Hotel Booking Management System. The system should simulate a real-world hotel where multiple customers attempt to book rooms concurrently. The hotel has a limited number of rooms, and booking requests must be handled safely to avoid data inconsistency. Each customer booking request must be processed in a separate thread. If no rooms are available, the booking thread must wait. When a room is released by another customer, waiting booking threads should be notified and allowed to proceed. Room details such as room number, room type, price per day, and booking status must be maintained using object-oriented principles. Use an enumeration to represent different room types and their base tariffs. All booking and cancellation details must be stored in a file and later read back and displayed to the user. Use appropriate thread synchronization techniques, simulate processing delays using Thread.sleep(), and handle all necessary exceptions.",
          ],
        },
      },
    },

    dbs: {
      Midsem: {
        "CCE-C": {
          year: "2026",
          questions: [
            "Create tables: AppUser(UID PK, Uname, Sub_Type ('Basic','Premium','VIP')), Movie(MID PK, Title UNIQUE, Genre, ReleaseYear (>=2000), Rating), WatchHistory(UID, MID, WatchDate NOT NULL). Implement SQL queries: (1) List all movies watched by users with Basic subscription in 2025, ordered by user name descending. (2) Find genres where the average movie rating is greater than 4. (3) Find users who watched more movies than the average number of movies watched per user.",
          ],
        },
      },

      Endsem: {
        "AIML-B": {
          year: "2026",
          questions: [
            "Create tables: service_request(srno numeric, request string, sr_date Date) and assign(srno references srno, department string). Constraints: request and department are NOT NULL; department must be one of ('NH Repair','Bridges','PWD'). Implement SQL queries: (1a) Find all service request numbers assigned to NH Repair department sorted in descending order of sr_date. (1b) Find service requests assigned to at least two departments. (2a) Find service requests containing 'oa' and assigned to PWD sorted in descending order of srno. (2b) For service requests of year 2022, find the number of departments to which each request has been assigned.",
          ],
        },
      },
    },
  },
};


