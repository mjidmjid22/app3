import express from 'express';
import Receipt from '../models/receipt.model';

const router = express.Router();

// Get all receipts
router.route('/').get((req, res) => {
  Receipt.find()
    .then(receipts => res.json(receipts))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Add a new receipt
router.route('/add').post((req, res) => {
  const { workerId, hoursWorked, date, total } = req.body;
  const newReceipt = new Receipt({ workerId, hoursWorked, date, total });

  newReceipt.save()
    .then(() => res.json('Receipt added!'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get receipts by worker ID
router.route('/worker/:workerId').get((req, res) => {
  Receipt.find({ workerId: req.params.workerId })
    .then(receipts => res.json(receipts))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Get a single receipt by ID
router.route('/:id').get((req, res) => {
  Receipt.findById(req.params.id)
    .then(receipt => res.json(receipt))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Delete a receipt by ID
router.route('/:id').delete((req, res) => {
  Receipt.findByIdAndDelete(req.params.id)
    .then(() => res.json('Receipt deleted.'))
    .catch(err => res.status(400).json('Error: ' + err));
});

// Update a receipt by ID
router.route('/update/:id').post((req, res) => {
  Receipt.findById(req.params.id)
    .then(receipt => {
      if (receipt) {
        receipt.workerId = req.body.workerId || receipt.workerId;
        receipt.hoursWorked = req.body.hoursWorked || receipt.hoursWorked;
        receipt.date = req.body.date || receipt.date;
        receipt.total = req.body.total || receipt.total;

        receipt.save()
          .then(() => res.json('Receipt updated!'))
          .catch(err => res.status(400).json('Error: ' + err));
      } else {
        res.status(404).json('Error: Receipt not found');
      }
    })
    .catch(err => res.status(400).json('Error: ' + err));
});

export default router;
