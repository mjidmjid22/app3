import express from 'express';
import Worker from '../models/worker.model';

const router = express.Router();

// Get all workers
router.route('/').get((req, res) => {
  Worker.find()
    .then(workers => res.json(workers))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Check if ID card number exists
router.route('/check-id/:idCardNumber').get((req, res) => {
  const { idCardNumber } = req.params;
  
  Worker.findOne({ idCardNumber: idCardNumber.trim() })
    .then(worker => {
      res.json({ exists: !!worker });
    })
    .catch(err => {
      console.error('Error checking ID card number:', err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    });
});

// Add a new worker
router.route('/add').post((req, res) => {
  console.log('Request to add worker received');
  console.log('Request body:', req.body);
  
  const { firstName, lastName, idCardNumber, dailyRate, position, startDate } = req.body;
  
  // Validate required fields
  if (!firstName || !lastName || !idCardNumber || !dailyRate || !position || !startDate) {
    console.error('Missing required fields');
    return res.status(400).json({ 
      error: 'Missing required fields', 
      details: {
        firstName: !firstName ? 'First name is required' : null,
        lastName: !lastName ? 'Last name is required' : null,
        idCardNumber: !idCardNumber ? 'ID card number is required' : null,
        dailyRate: !dailyRate ? 'Daily rate is required' : null,
        position: !position ? 'Position is required' : null,
        startDate: !startDate ? 'Start date is required' : null
      }
    });
  }
  
  // Validate data types
  if (isNaN(Number(dailyRate))) {
    console.error('Invalid daily rate:', dailyRate);
    return res.status(400).json({ error: 'Daily rate must be a valid number' });
  }
  
  if (!Date.parse(startDate)) {
    console.error('Invalid start date:', startDate);
    return res.status(400).json({ error: 'Start date must be a valid date' });
  }
  
  const newWorker = new Worker({ 
    firstName: firstName.trim(), 
    lastName: lastName.trim(), 
    idCardNumber: idCardNumber.trim(), 
    dailyRate: Number(dailyRate), 
    position: position.trim(), 
    startDate: new Date(startDate),
    isChecked: req.body.isChecked || false,
    isPaid: req.body.isPaid || false
  });

  newWorker.save()
    .then((savedWorker) => {
      console.log('Worker added successfully:', savedWorker);
      res.json(savedWorker); // Return the saved worker object instead of just a message
    })
    .catch(err => {
      if (err.name === 'ValidationError') {
        console.error('Validation error:', err.message);
        const validationErrors: any = {};
        for (let field in err.errors) {
          validationErrors[field] = err.errors[field].message;
        }
        return res.status(400).json({ 
          error: 'Validation Error', 
          details: validationErrors 
        });
      }
      if (err.code === 11000) {
        console.error('Duplicate key error:', err.message);
        return res.status(400).json({ error: 'Worker with this ID card number already exists' });
      }
      console.error('Error adding worker:', err);
      res.status(500).json({ error: 'Internal Server Error', details: err.message });
    });
});

// Get a single worker by ID
router.route('/:id').get((req, res) => {
  Worker.findById(req.params.id)
    .then(worker => res.json(worker))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a worker by ID
router.route('/:id').delete((req, res) => {
  Worker.findByIdAndDelete(req.params.id)
    .then(() => res.json('Worker deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update a worker by ID
router.route('/update/:id').post((req, res) => {
  console.log('Request to update worker received');
  console.log('Worker ID:', req.params.id);
  console.log('Update data:', req.body);
  
  Worker.findById(req.params.id)
    .then(worker => {
      if (worker) {
        // Update basic fields only if provided
        if (req.body.firstName !== undefined) worker.firstName = req.body.firstName;
        if (req.body.lastName !== undefined) worker.lastName = req.body.lastName;
        if (req.body.idCardNumber !== undefined) worker.idCardNumber = req.body.idCardNumber;
        if (req.body.dailyRate !== undefined) worker.dailyRate = req.body.dailyRate;
        if (req.body.position !== undefined) worker.position = req.body.position;
        if (req.body.startDate !== undefined) worker.startDate = req.body.startDate;
        
        // Update status fields (allow boolean values including false)
        if (req.body.isChecked !== undefined) worker.isChecked = req.body.isChecked;
        if (req.body.isPaid !== undefined) worker.isPaid = req.body.isPaid;

        worker.save()
          .then((updatedWorker) => {
            console.log('Worker updated successfully:', updatedWorker);
            res.json(updatedWorker); // Return the updated worker object
          })
          .catch(err => {
            console.error('Error saving worker:', err);
            res.status(400).json('Error: ' + err);
          });
      } else {
        console.error('Worker not found with ID:', req.params.id);
        res.status(404).json('Error: Worker not found');
      }
    })
    .catch(err => {
      console.error('Error finding worker:', err);
      res.status(400).json('Error: ' + err);
    });
});

export default router;