const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const app = express();

app.use(express.json());
app.use(cors())

// Use morgan middleware with 'tiny' configuration for logging
app.use(morgan('tiny'));

morgan.token('postData', (req) => {
    if (req.method === 'POST') {
      return JSON.stringify(req.body);
    }
    return '-';
  });

app.use(morgan(':method :url :status :res[content-length] - :response-time ms :postData'));

  
let persons = [
    { 
      "id": 1,
      "name": "Arto Hellas", 
      "number": "040-123456"
    },
    { 
      "id": 2,
      "name": "Ada Lovelace", 
      "number": "39-44-5323523"
    },
    { 
      "id": 3,
      "name": "Dan Abramov", 
      "number": "12-43-234345"
    },
    { 
      "id": 4,
      "name": "Mary Poppendieck", 
      "number": "39-23-6423122"
    }
]
const generateId = () => {
    const minRange = 1;
    const maxRange = 100000000; 

    let randomId;

    do {
        randomId = Math.floor(Math.random() * (maxRange - minRange + 1)) + minRange;
    } while (persons.some(person => person.id === randomId));

    return randomId;
};


app.get('/', (req, res) => {
  res.send('<h1>Hello World!</h1>')
})

app.get('/api/persons', (req, res) => {
  res.json(persons)
})

app.get('/info', (req, res) => {
    const amount_of_people = persons.length;
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
  if (persons.some(person => person.name === body.name)) {
    return response.status(400).json({
        error: 'name already in use'
    })
}

  const person = {
    name: body.name,
    number: body.number,
    id: generateId(),
  }

  persons = persons.concat(person)

  response.json(person)
})

app.get('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  const person = persons.find(person => person.id === id)

  if (person) {
    response.json(person)
  } else {
    response.status(404).end()
  }

})

app.delete('/api/persons/:id', (request, response) => {
  const id = Number(request.params.id)
  persons = persons.filter(person => person.id !== id)

  response.status(204).end()
})

const PORT = 3001
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})