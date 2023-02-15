const express = require('express');
const router = express.Router();
const Controller = require('../controllers/companyController')
/* GET users listing. */
router.post('/add' , Controller.add )
router.post('/create-profile' , Controller.createProfile )
router.put('/update-profile' , Controller.updateProfile )
router.post('/follow-company' , Controller.followCompany )
router.get('/following-users/:companyId' , Controller.fetchFollowingUsers )
router.get('/fetch-all' , Controller.fetchAllCompanies )
router.get('/fetch-company-events/:companyId' , Controller.fetchCompanyEvents )
router.get('/fetch-company-events-bookings/:companyId' , Controller.fetchCompanyEventsBookings )
router.post('/update-status' , Controller.fetchCompanyEventsBookingsStatus )

module.exports = router;
