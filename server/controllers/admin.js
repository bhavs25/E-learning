import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { rm } from "fs";
import { promisify } from "util";
import fs from "fs";
import { User } from "../models/User.js";

export const createCourse=TryCatch(async(req,res)=>{
    const {title,description,category,createdBy,duration,price}=req.body;
    const image = req.files?.image?.[0];
    await Courses.create({
        title,
        description,
        category,
        createdBy,
        image:image?.path,
        duration,
        price,
    });
    res.status(201).json({
        message:"Course created successfully",
    })
});
export const addLectures=TryCatch(async(req,res)=>{
    const course=await Courses.findById(req.params.id);
    if(!course)
        return res.status(404).json({
    message:"No Course with this id",
    });
    const {title,description}=req.body;
   const file = req.files?.video?.[0];
    const lecture =await Lecture.create({
        title,
        description,
        video:file?.path,
        course:course._id,
    });
    res.status(201).json({
        message:"Lecture added successfully",
        lecture,
    });
})

export const deleteLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);

  rm(lecture.video, () => {
    console.log("Video deleted");
  });

  await lecture.deleteOne();

  res.json({ message: "Lecture Deleted" });
});

const unlinkAsync = promisify(fs.unlink);

export const deleteCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);

  const lectures = await Lecture.find({ course: course._id });

  await Promise.all(
    lectures.map(async (lecture) => {
      await unlinkAsync(lecture.video);
      console.log("video deleted");
    })
  );

  rm(course.image, () => {
    console.log("image deleted");
  });

  await Lecture.find({ course: req.params.id }).deleteMany();

  await course.deleteOne();

  await User.updateMany({}, { $pull: { subscription: req.params.id } });

  res.json({
    message: "Course Deleted",
  });
});

export const getAllStats = TryCatch(async (req, res) => {
  const totalCoures = (await Courses.find()).length;
  const totalLectures = (await Lecture.find()).length;
  const totalUsers = (await User.find()).length;

  const stats = {
    totalCoures,
    totalLectures,
    totalUsers,
  };

  res.json({
    stats,
  });
});

export const getAllUser = TryCatch(async (req, res) => {
  const users = await User.find({ _id: { $ne: req.user._id } }).select(
    "-password"
  );

  res.json({ users });
});
