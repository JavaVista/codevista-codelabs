author: Google Cloud Team
summary: Code to Cloud: Deploying a Full-Stack Angular App with Cloud Run & Cloud SQL
id: cloud-sql-cloud-run-angular-deployment
categories: backend,database,cloud,angular
environments: Web
status: Published
feedback_link: https://github.com/JavaVista/codevista-codelabs/issues

# Code to Cloud: Deploying a Full-Stack Angular App with Cloud Run & Cloud SQL

## Overview

Duration: 0:10:00

In this codelab, you'll learn how to deploy a full-stack application with a database to [Google Cloud](https://cloud.google.com/). You'll use the [Cloud SQL Node.js connector](https://github.com/GoogleCloudPlatform/cloud-sql-nodejs-connector) to connect a Node.js backend to a [Cloud SQL](https://cloud.google.com/sql) for [PostgreSQL](https://cloud.google.com/sql/postgresql) database, and an [Angular](https://angular.io/) frontend to interact with the backend.

### What you'll 

- How to create a Cloud SQL instance
- How to connect to Cloud SQL from a Node.js application
- How to create a simple Angular frontend
- How to deploy the application to Google Cloud

### What you'll need

- Laptop + Google account (free trial OK), and billing enabled
- A Google Cloud project
- A browser, such as Chrome or Firefox
- Familiarity with Node.js, Angular, and SQL

---

## Prerequisites

Duration: 0:10:00

Before you begin, ensure you have a [Google Account](https://accounts.google.com/SignUp).

- If you do not already have a Google account, you must create a Google account.
- Use a personal account instead of a work or school account. Work and school accounts may have restrictions that prevent you from enabling the APIs needed for this lab.

---

## Setup

Duration: 0:10:00

1. **Create a Cloud SQL for PostgreSQL instance**
    - In the Google Cloud Console, navigate to the Cloud SQL instances page.
    - Click **Create instance**.
    - Click **Choose PostgreSQL**.
    - Enter an instance ID, for example, `codelab-instance`.
    - Enter a password for the `postgres` user.
    - Click **Create**.

2. **Enable the Cloud SQL Admin API**
    - In the Google Cloud Console, navigate to the APIs & Services dashboard.
    - Click **Enable APIs and Services**.
    *   Search for `Cloud SQL Admin API` and enable it.

3.  **Create a service account**
    *   In the Google Cloud Console, navigate to the Service accounts page.
    *   Click **Create service account**.
    *   Enter a name, for example, `codelab-service-account`.
    *   Grant the **Cloud SQL Client** role to the service account.
    *   Click **Done**.
    *   Create a key for the service account and download it as a JSON file.

---

## Backend
Duration: 0:20:00

1.  **Create a Node.js application**
    *   Create a new directory for your application.
    *   Initialize a new Node.js project: `npm init -y`
    *   Install the required dependencies: `npm install express @google-cloud/cloud-sql-connector`

2.  **Create the server**
    *   Create a file named `index.js` and add the following code:

    ```javascript
    const express = require('express');
    const { Connector } = require('@google-cloud/cloud-sql-connector');

    const app = express();
    const port = process.env.PORT || 8080;

    const connector = new Connector();
    const clientOpts = await connector.getOptions({
      instanceConnectionName: process.env.INSTANCE_CONNECTION_NAME,
      ipType: 'PUBLIC',
    });

    const pool = new pg.Pool({
      ...clientOpts,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
    });

    app.get('/', async (req, res) => {
      const { rows } = await pool.query('SELECT NOW()');
      res.send(`Hello from the database! The time is ${rows[0].now}`);
    });

    app.listen(port, () => {
      console.log(`Server listening on port ${port}`);
    });
    ```

---

## Frontend
Duration: 0:20:00

1.  **Create an Angular application**
    *   Install the Angular CLI: `npm install -g @angular/cli`
    *   Create a new Angular application: `ng new frontend`

2.  **Create a service to fetch data from the backend**
    *   Generate a new service: `ng generate service data`
    *   Add the following code to `data.service.ts`:

    ```typescript
    import { Injectable } from '@angular/core';
    import { HttpClient } from '@angular/common/http';

    @Injectable({
      providedIn: 'root'
    })
    export class DataService {
      constructor(private http: HttpClient) { }

      getData() {
        return this.http.get('/api', { responseType: 'text' });
      }
    }
    ```

3.  **Display the data in the component**
    *   Add the following code to `app.component.ts`:

    ```typescript
    import { Component, OnInit } from '@angular/core';
    import { DataService } from './data.service';

    @Component({
      selector: 'app-root',
      templateUrl: './app.component.html',
      styleUrls: ['./app.component.css']
    })
    export class AppComponent implements OnInit {
      data = '';

      constructor(private dataService: DataService) { }

      ngOnInit() {
        this.dataService.getData().subscribe(data => {
          this.data = data;
        });
      }
    }
    ```

    *   Add the following code to `app.component.html`:

    ```html
    <h1>{{ data }}</h1>
    ```

---

## Deployment
Duration: 0:10:00

1.  **Deploy the backend to Cloud Run**
    *   Create a `Dockerfile` for the backend:

    ```dockerfile
    FROM node:16
    WORKDIR /usr/src/app
    COPY package*.json ./
    RUN npm install
    COPY . .
    CMD [ "node", "index.js" ]
    ```

    *   Build and push the Docker image to Google Container Registry.
    *   Deploy the image to Cloud Run.

2.  **Deploy the frontend to Firebase Hosting**
    *   Initialize Firebase Hosting in your Angular project.
    *   Build the Angular application: `ng build --prod`
    *   Deploy the application to Firebase Hosting: `firebase deploy`
