# NextJs JWT Authentication Example

This project is a demonstration of how to setup authentication with JWT tokens without using complicated external libraries for managing authentication.

Read about it in my [medium article](https://medium.com/gitconnected/simple-jwt-authentication-with-ssr-and-csr-in-nextjs-5311b680a35a).

## How to Run

To run the backend, simply do:

- `cd back`
- `npm i`
- `npm start`

To run the frontend, simply do:

- `cd front`
- `npm i`
- `npm run dev`

## The Setup

The project is very simple, a NodeJs backend that has 3 endpoints:

- `/sign-up` that allows user to make a POST request with `username` and `password` to create a user
- `/sign-in` that allows the user to make a POST request with `username` and `password`, which returns a JWT
- `/ready` that allows the user to verify their JWT with a POST request with `username` and `password`
