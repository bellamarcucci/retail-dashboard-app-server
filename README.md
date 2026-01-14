# Retail Dashboard App Server

This repository contains the backend server responsible for powering the Arkisanté Ecommerce and Admin Dashboard front end.

The server provides a REST API used by the front end application to manage products, stock levels, reviews, purchases, and analytics data displayed in the admin dashboard.

It was designed to simulate a real world ecommerce backend while remaining simple, readable, and easy to integrate with a vanilla JavaScript front end.

## Project Overview

The purpose of this server is to:

* Provide product data for the ecommerce storefront
* Handle stock control and inventory updates
* Store and process customer reviews
* Simulate purchase transactions
* Supply analytics data for the admin dashboard
* Serve as a backend layer for front end API integration practice

This project focuses on API design, data flow, and front end to back end communication.

## API Responsibilities

The server handles the following responsibilities:

* Product listing and individual product retrieval
* Stock validation and stock updates
* Review submission and aggregation
* Purchase processing and stock deduction
* Admin dashboard analytics
    * Review sentiment summary
    * Product stock overview
    * Sales potential simulation

All responses are returned in JSON format and consumed directly by the front end.

## Technologies Used

* Node.js
* Express.js
* JavaScript
* RESTful API principles
* JSON based data storage
* CORS configuration for local development

## API Endpoints Overview

The main endpoints exposed by this server include:

* GET /api/products  
  Returns the full list of products

* GET /api/products/:id  
  Returns a single product by ID with reviews

* POST /api/review/:id  
  Submits a review for a specific product

* POST /api/purchase  
  Processes a purchase and updates stock levels

* GET /api/admin/dashboard  
  Returns analytics data for the admin dashboard

* POST /api/admin/stock  
  Updates product stock values

## Relationship With the Front End

This server is required to run the front end application located at:

https://github.com/bellamarcucci/retail-dashboard-app

The front end consumes this API using the Fetch API and expects the server to be running locally at:

http://localhost:3000/api

Without this server running, the front end will not be able to load products, manage the cart, submit reviews, or display admin analytics.

## How to Run the Server

1. Clone or download this repository
2. Install dependencies:
