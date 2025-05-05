const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

let data = Array.from({length: 1_000_000}, (_, i) => ({id : i + 1}));

app.get('/items', (req, res) => {
    const {offset =0, limit = 20, query = ''} = req.query;
    console.log('REQUEST:', {offset, limit, query});
try {
    let filtered = data.filter(item => item.id.toString().includes(query));
    const result = filtered.slice(Number(offset), Number(offset) + Number(limit));
    res.json({ data: result, total: filtered.length})

} catch(err) {
    console.error("ERRPOR:", err);
    res.status(500).send("internal server error");
}
})
app.listen(PORT, () => console.log(`Server on... http://localhost: ${PORT}`));