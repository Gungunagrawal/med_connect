# MedConnect API Documentation

Base URL: `http://localhost:4000/api`

## User Routes (`/users`)
- **POST `/register`**: Register a new patient. (Public)
- **POST `/login`**: Authenticate patient via Email/Password -> Returns JWT. (Public)
- **GET `/profile`**: Get current logged-in patient's profile. (Private)
- **POST `/book-appointment`**: Create a new appointment. Requires `doctorId`, `date`, `time`. (Private)
- **GET `/appointments`**: List all appointments for the logged-in patient. (Private)
- **PUT `/cancel-appointment/:id`**: Set status of an appointment to 'Rejected'/'Cancelled'. (Private)

## Doctor Routes (`/doctors`)
- **GET `/list`**: Fetch public list of all active doctors. (Public)
- **POST `/login`**: Authenticate doctor via Email/Password -> Returns JWT. (Public)
- **GET `/appointments`**: Get all appointments scheduled with the logged-in doctor. (Private - Doctor)
- **PUT `/appointment/:id`**: Update status (`Approved` or `Rejected`) of a specific appointment. (Private - Doctor)
- **PUT `/profile`**: Update doctor profile info (`fees`, `about`, `experience`, `availability`). (Private - Doctor)

## Admin Routes (`/admins`)
- **POST `/login`**: Authenticate admin via Email/Password -> Returns JWT. (Public)
- **POST `/add-doctor`**: Create a new Doctor profile on the platform. (Private - Admin)
- **DELETE `/doctor/:id`**: Remove a doctor from the platform. (Private - Admin)
- **GET `/users`**: List all registered patients. (Private - Admin)
- **GET `/appointments`**: List all appointments platform-wide. (Private - Admin)
- **GET `/dashboard`**: Retrieve critical stats for admin dashboard view. (Private - Admin)

_Note: (Private) means `Authorization: Bearer <token>` is required in headers._
