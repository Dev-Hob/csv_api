const cors = require("cors");
const multer = require("multer")
const csv=require('csvtojson');
const express = require("express");


const specifiedURLAccess = ['http://localhost:3001']
const PORT = 3030;
const app = express()

app.use(express.json())
app.use(cors({
    origin: specifiedURLAccess
  }))
  
  const upload = multer({ dest: 'uploads/' })

  app.post("/csv", upload.single("csv"), async (req, res) => {
    const file = req.file;
    if(!file) return res.status(400).send("Please Attach a csv file.");
    if(file.mimetype != "text/csv") return res.status(400).send("file should be csv!")
    console.log(file)
    const path = file.path
    try {
        let studentData = await csv().fromFile(path)
        studentData = JSON.parse(studentData)
        const filteredData = await Promise.all(studentData.map( student => {
            const {name, username, class: class_value, academic_year, approved = false} = student;
            if(!name || !username || !class_value || !academic_year) return false;
            if(typeof name != 'string') return false;
            if(typeof username != 'string') return false;
            if(typeof class_value != 'string') return false;
            if(typeof academic_year != 'string') return false;
            if(!student.approved) student.approved = approved;
            return 
        }).filter(Boolean))
        const msg = filteredData.length !== studentData.length ? "Some student were filtered for errorneous data!" : "All student were formated!";
        res.status(200).json({data: filteredData, msg})
    } catch (error) {
        console.log(error);
        res.status(400).send("Error Occured while processing file!")
    }
  })

  app.use("*", (req, res) => {
    res.status(404).send("Not Found!")
  })

  app.listen(PORT, (error) => {
    if(error) return console.log(error)
    console.log("Server is listening at Port : ", PORT)
  })