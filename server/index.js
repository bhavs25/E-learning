import express from 'express';
import dotenv from "dotenv";
import {connectDb} from "./database/db.js"
import Razorpay from 'razorpay';
import cors from 'cors';
dotenv.config();
export const instance=new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID,
    key_secret: process.env.RAZORPAY_KEY_SECRET,
})
const app=express()
//using middlewares
app.use(express.json());
app.use(cors());
const port=process.env.port;
app.get('/',(req,res)=>{
    res.send('Server Running');
});
// importing routes
import userRouter from './routes/user.js'
import courseRoutes from './routes/course.js'
import adminRoutes from './routes/admin.js'
//using routes
app.use('/uploads', express.static('uploads'));
app.use('/api',userRouter);
app.use('/api',courseRoutes);
app.use('/api',adminRoutes);
app.listen(port,()=>{
    console.log(`server is running on port http://localhost:${port}`);
    connectDb();
});