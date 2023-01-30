# Netrace.js

This is a simple application to create rooms and run scans over a socket

---

## Disclaimer

This application is made for educational purposes and is not meant to be used as a professional tool.

---

## How does it work?

Create a room in the root endpoint `/` then you will be redirected to `/roomd/{room_id}`.
Here you will generate scans; each scan will require:

- label: a simple identifier
- requests: the number of requests (packets) to be sent to the socket

Once the scan is finished, the results will incude

- bandwidth
- Average Round-Trip Time

---

## How to run it

Install all the dependencies

### npm

`npm install`

create your `.env` file

```
NEXTAUTH_URL=http://localhost:3000
DATABASE_URL=<your database url>
```

### Apply migration

`npx prisma db push`

### run server

`npm run dev`
