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
            `Cricket Game Simulation (Multithreading + Enum + Interface)

Objective:
Create a Java program that simulates a simple cricket match using threads.

Requirements:
1. Create an enum:
   Shot { ONE, TWO, FOUR, SIX, OUT }

2. Create an interface with methods:
   - run()
   - appeal()
   - umpireDecision()

3. Create a class CricketPlayer that implements this interface.

4. Game Logic:
   - If the shot is ONE, TWO, FOUR, or SIX → add runs to total score.
   - If the shot is OUT → display total runs and print "OUT".

5. Bowler Thread:
   - Can make an appeal.

6. Umpire Thread:
   - Decides whether player is OUT using a boolean variable isOut.

7. Use 3 threads:
   - Player Thread
   - Bowler Thread
   - Umpire Thread

8. Make the program menu-driven (user selects shots).`
          ]
        },
        "DSE-C": {
          year: "2026",
          questions: [
            `Library Book Lending System (Multithreading + OOP + Enum + Interface)

Objective:
Create a thread-safe library system where students can borrow and return books.

Requirements:
1. Create an interface LibraryOperations:
   - borrowBook()
   - returnBook()

2. Create a base class:
   LibraryMember
   - memberName
   - booksBorrowed

3. Create a derived class:
   StudentMember
   - extends LibraryMember
   - implements LibraryOperations

4. Create enum:
   TransactionType { BORROW, RETURN, NOT_AVAILABLE }

5. Create 3 threads:
   - Borrowing Thread (student borrows book)
   - Returning Thread (student returns book)
   - Librarian Thread (checks availability and announces status)

6. Use synchronization to ensure:
   - Book count updates safely.
   - No borrowing when stock = 0.
   - Only valid operations happen.

7. After every transaction display:
   - Transaction Type
   - Available books
   - Books borrowed by student
   - Final status from Librarian`
          ]
        },
        "CCE-D": {
          year: "2026",
          questions: [
            `Hotel Booking Management System (Multithreading + File Handling)

Objective:
Simulate multiple users booking hotel rooms concurrently.

Requirements:
1. Maintain limited rooms.
2. If no room available → thread must wait.
3. When room is freed → waiting threads are notified.
4. Store room details:
   - Room number
   - Room type (use enum)
   - Tariff
   - Booking status
5. Store booking and cancellation details in a file.
6. Use:
   - Synchronization
   - Thread.sleep()
   - Exception handling`
          ]
        },
        "AIML-C": {
          year: "2026",
          questions: [
            `File-Based Chat System (Multithreading + Synchronization)

Objective:
Simulate a chat system using a shared file.

Requirements:
1. Use a shared file: chatlog.txt
2. Create 3 threads:
   - Sender (writes message)
   - Receiver (reads message)
   - Moderator (approves/rejects message)
3. Use:
   - synchronized
   - wait()
   - notify() / notifyAll()
4. Ensure:
   - No read/write conflict
   - No message is partially read
5. Stop after predefined number of messages.`
          ]
        },
        "CCE-C": {
          year: "2026",
          questions: [
            `Sensor Data Logging System 
(Multithreading + Unbuffered Character Streams)

Objective:
Simulate a temperature sensor system that writes and reads data from a file.

Requirements:

1. Create a shared file:
   sensordata.txt

2. Create 3 threads:

   (a) Sensor Thread:
       - Periodically generates temperature readings.
       - Writes readings into sensordata.txt.
       - Use FileWriter (unbuffered character stream).

   (b) Monitor Thread:
       - Reads data from sensordata.txt.
       - Displays recorded readings.
       - Use FileReader (unbuffered character stream).

   (c) Controller Thread:
       - Monitors the process.
       - Announces when all readings are recorded.
       - Displays:
           • Total file size
           • Confirmation message

3. Synchronization Rules:
   - Only one thread can access the file at a time.
   - Monitor must not read while Sensor is writing.
   - No partial or corrupted data should be read.

4. Console Output Must Show:
   - Sensor writing readings.
   - Monitor reading readings.
   - Final confirmation and file statistics from Controller.`
          ]
        },
        "CSE-D": {
          year: "2026",
          questions: [
            `Exam Answer Logging Mechanism 
    (Multithreading + File Handling + Synchronization)

    Objective:
    Simulate an exam answer logging system where student answers are written to a file, 
    read back, and monitored when maximum submission limit is reached.

    Requirements:

    1. Create shared file:
      examlog.txt

    2. Maximum limit:
      - Only 3 students (hardcoded).
      - Example entries:
          "Student 1 Answer A"
          "Student 2 Answer B"
          "Student 3 Answer C"

    3. Create 3 threads:

      (a) Writer Thread:
          - Writes answers to file using FileWriter.
          - Increments count after each write.
          - Notifies Reader.
          - If count == 3 → notify Supervisor.

      (b) Reader Thread:
          - Reads full file using FileReader.
          - Must not read while Writer is writing.

      (c) Supervisor Thread:
          - Activates when count == 3.
          - Displays file name and file size.
          - Prints confirmation message.

    4. Synchronization:
      - Only one thread accesses file at a time.
      - Use synchronized, wait(), notify()/notifyAll().
      - No partial read/write allowed.
    `
          ]
        }
      }
    },
    dbsl: {
      Midsem: {
        "CCE-C": {
          year: "2026",
          questions: [
            `Movie Streaming Database System

    Objective:
    Write SQL queries based on the given tables and constraints.

    Tables:

    1. AppUser
      - UID (Primary Key)
      - Uname
      - Sub_Type CHECK ('Basic','Premium','VIP')

    2. Movie
      - MID (Primary Key)
      - Title (UNIQUE)
      - Genre
      - ReleaseYear (must be >= 2000)
      - Rating

    3. WatchHistory
      - UID (Foreign Key references AppUser)
      - MID (Foreign Key references Movie)
      - WatchDate (NOT NULL)

    Questions:

    1. List all movies watched by users with subscription type 'Basic' in the year 2025.
      - Display results ordered by Uname in descending order.

    2. Find genres whose average movie rating is greater than 4.

    3. Find users who have watched more movies than the average number of movies watched per user.`
          ]
        },
        "AIML-B": {
          year: "2026",
          questions: [
            `Public Service Request Database

    Objective:
    Write SQL queries using the given tables.

    Tables:

    1. service_request
      - srno (Primary Key)
      - request (NOT NULL)
      - sr_date

    2. assign
      - srno (Foreign Key references service_request)
      - department CHECK ('NH Repair','Bridges','PWD')

    Questions:

    1a. Display SR numbers assigned to the 'NH Repair' department.
        - Order results by sr_date in descending order.

    1b. Find service requests that are assigned to at least two different departments.

    2a. Find SR numbers that:
        - Contain the word 'oa' in the request text
        - Are assigned to 'PWD'
        - Order by srno in descending order.

    2b. For the year 2022:
        - Count how many departments are assigned to each service request.`
          ]
        },
        "IT-A": {
          year: "2026",
          questions: [
            `Sensor Observation Database

    Objective:
    Write SQL queries using aggregation and conditions.

    Tables:

    1. Sensor
      - SID (Primary Key)
      - sensor_type
      - unit CHECK ('C','F','%')
      - location

    2. Observations
      - OID (Primary Key)
      - temperature (must be >= -270)
      - humidity (between 0 and 100)
      - SID (Foreign Key references Sensor)

    Questions:

    1a. Find the average temperature of all records where temperature is not zero.

    1b. For each sensor_type:
        - Display sensor_type
        - Count of sensors
        - Average temperature
        - Average humidity
        (Only include sensor types where both temperature and humidity values are non-zero.)

    2a. Find:
        - Maximum recorded temperature
        - Maximum recorded humidity
        across all sensors.

    2b. Count actual number of:
        - Temperature sensors (non-zero temperature)
        - Humidity sensors (non-zero humidity)

        Note:
        If a sensor has both non-zero temperature and humidity,
        count it once as temperature sensor and once as humidity sensor.`
          ]
        }
      }
    }
  }
};

