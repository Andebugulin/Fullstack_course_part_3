const express = require('express');
const morgan = require('morgan');
const app = express();
const mongoose = require('mongoose');
require('dotenv').config();
const cors = require('cors');
app.use(cors());

const Contact = require('./models/contact');


app.use(express.json());
app.use(express.static('dist'));

// Use morgan middleware with 'tiny' configuration for logging
app.use(morgan('tiny'));

morgan.token('postData', (req) => {
    if (req.method === 'POST') {
      return JSON.stringify(req.body);
    }
    return '-';
  });

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'));

app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  Contact.find({}).then(contacts => {
    res.json(contacts);
  }).catch(error => {
    console.error('Error fetching contacts:', error.message);
    res.status(500).send('Internal Server Error');
  });
})

app.get('/info', (req, res) => {
    const amount_of_people = Contact.length; // Get the number of people in the phonebook
    const currentTime = new Date().toLocaleTimeString(); // Get current time

    
    const message = `
        <div>
            <p>
                Phonebook has info for ${amount_of_people} people
            </p>
            <p>
                Request received at: ${currentTime}
            </p>
        </div>
    `;
  
    res.send(message);
});


app.post('/api/persons', (request, response) => {
  const body = request.body

  if (!body.name || !body.number) {
    return response.status(400).json({ 
      error: 'name or number missing' 
    })
  }


  const person = new Contact({
    name: body.name,
    number: body.number,
  });
  person.save()
      .then(savedPerson => {
        response.json(savedPerson);
      })
      .catch(error => {
        console.error('Error saving contact:', error.message);
        response.status(500).send('Internal Server Error');
      });
  }
);

app.get('/api/persons/:id', (request, response) => {
  const id = request.params.id
  Contact.findById(id).then(person => {
    if (person) {
      response.json(person)
    } else {
      response.status(404).end()
    }
  }
  ).catch(error => {
    console.error('Error fetching contact:', error.message);
    response.status(500).send('Internal Server Error');
  });

})

app.delete('/api/persons/:id', (request, response) => {
  Contact.findByIdAndDelete(request.params.id)
    .then(result => {
      response.status(204).end()
    })
    .catch(error => {
      console.error('Error deleting contact:', error.message)
      response.status(500).send('Internal Server Error')
    })
})

const PORT = process.env.PORT || 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})