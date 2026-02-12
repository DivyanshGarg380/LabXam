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
            `Cricket Game Simulation (Multithreading + Enum + Interface):
            • Create an enum Shot { ONE, TWO, FOUR, SIX, OUT }.
            • Create a CricketPlayer class implementing an interface with methods: run(), appeal(), umpireDecision().
            • If shot ≠ OUT → add runs.
            • If OUT → display total runs and print "OUT".
            • Bowler can appeal and umpire checks using boolean isOut.
            • Use three threads and implement everything in a menu-driven program.`
          ],
        },

        "CCE-D": {
          year: "2026",
          questions: [
            `Hotel Booking Management System (Multithreading + File Handling):
            • Simulate concurrent room booking using threads.
            • Limited rooms — if unavailable, threads must wait.
            • When a room is released, waiting threads must be notified.
            • Maintain room details (number, type, tariff, booking status).
            • Use enum for room types and base tariffs.
            • Store booking/cancellation details in a file and read them back.
            • Apply synchronization, Thread.sleep(), and exception handling.`
          ],
        },
        "AIML-C": {
          year: "2026",
          questions: [
            `File-Based Chat System (Multithreading + Synchronization):
            • Implement Sender, Receiver, and Moderator threads.
            • Use a shared file 'chatlog.txt' for communication.
            • Sender writes one message at a time and notifies others.
            • Receiver reads only after a new message is written.
            • Moderator validates each message (Approve/Reject).
            • Use synchronized, wait(), notify()/notifyAll().
            • Ensure no read/write conflicts and proper coordination.
            • Run until a predefined number of messages are exchanged.`
          ],
        },
      },
    },

    dbsl: {
      Midsem: {
        "CCE-C": {
          year: "2026",
          questions: [
            `Tables:
            • AppUser(UID PK, Uname, Sub_Type CHECK('Basic','Premium','VIP'))
            • Movie(MID PK, Title UNIQUE, Genre, ReleaseYear >= 2000, Rating)
            • WatchHistory(UID FK, MID FK, WatchDate NOT NULL)

            Queries:
            1. List movies watched by Basic users in 2025 and order by Uname DESC
            2. Find genres with average rating > 4
            3. Find users who watched more movies than the average per user`
          ],
        },

        "AIML-B": {
          year: "2026",
          questions: [
            `Tables:
            • service_request(srno PK, request NOT NULL, sr_date)
            • assign(srno FK, department NOT NULL CHECK('NH Repair','Bridges','PWD'))

            Queries:
            1a. SR numbers assigned to 'NH Repair' and order by sr_date DESC
            1b. Service requests assigned to at least two departments
            2a. SRs containing 'oa' assigned to 'PWD' and order by srno DESC
            2b. For year 2022, count departments per service request`
          ],
        },
        "IT-A": {
          year: "2026",
          questions: [
            `Tables:
            • Sensor(SID PRIMARY KEY, sensor_type, unit CHECK('C','F','%'), location)
            • Observations(OID PRIMARY KEY, temperature >= -270, humidity BETWEEN 0 AND 100, SID REFERENCES Sensor(SID))

            Queries:
            1a. Find the average temperature of all non-zero temperature records
            1b. Find sensor_type, count of sensors, average temperature, and average humidity for sensor types that record both non-zero temperature and non-zero humidity
            2a. Find maximum recorded temperature and maximum recorded humidity across all sensors
            2b. Count actual number of temperature sensors and humidity sensors based on non-zero values (If a Smart sensor has both non-zero temperature and humidity, count it twice: once as temperature sensor and once as humidity sensor)`,
          ],
        } 
      },
    },
  },
};


