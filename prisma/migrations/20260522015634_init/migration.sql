-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('male', 'female');

-- CreateEnum
CREATE TYPE "Status" AS ENUM ('active', 'inactive', 'suspended');

-- CreateEnum
CREATE TYPE "CoachStatus" AS ENUM ('active', 'inactive', 'on_leave');

-- CreateEnum
CREATE TYPE "CourseType" AS ENUM ('regular', 'exam_prep', 'camp', 'competition');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('present', 'absent', 'late', 'leave', 'unmarked');

-- CreateEnum
CREATE TYPE "BeltLevel" AS ENUM ('white', 'white-yellow', 'yellow', 'yellow-green', 'green', 'green-blue', 'blue', 'blue-red', 'red', 'red-black', 'black');

-- CreateTable
CREATE TABLE "students" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthDate" DATE,
    "id_card" TEXT,
    "phone" TEXT,
    "photo_url" TEXT,
    "enrollment_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "remaining_sessions" INTEGER NOT NULL DEFAULT 0,
    "expiry_date" DATE,
    "status" "Status" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "students_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "coaches" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "birthDate" DATE,
    "id_card" TEXT,
    "phone" TEXT,
    "photo_url" TEXT,
    "join_date" DATE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "bio" TEXT,
    "status" "CoachStatus" NOT NULL DEFAULT 'active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coaches_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "courses" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "type" "CourseType" NOT NULL DEFAULT 'regular',
    "start_time" TIMESTAMP(3) NOT NULL,
    "end_time" TIMESTAMP(3) NOT NULL,
    "coach_id" TEXT,
    "location" TEXT,
    "max_students" INTEGER NOT NULL DEFAULT 30,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "courses_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "course_id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "attendance_date" DATE NOT NULL,
    "status" "AttendanceStatus" NOT NULL DEFAULT 'unmarked',
    "checked_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "gradings" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "exam_date" DATE NOT NULL,
    "belt_level" "BeltLevel" NOT NULL,
    "certificate_no" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "gradings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "competitions" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "competition_date" DATE NOT NULL,
    "competition_name" TEXT NOT NULL,
    "category" TEXT,
    "result" TEXT,
    "award" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "competitions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "camps" (
    "id" TEXT NOT NULL,
    "student_id" TEXT NOT NULL,
    "activity_date" DATE NOT NULL,
    "activity_name" TEXT NOT NULL,
    "location" TEXT,
    "duration" INTEGER,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "camps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "students_name_idx" ON "students"("name");

-- CreateIndex
CREATE INDEX "students_status_idx" ON "students"("status");

-- CreateIndex
CREATE INDEX "coaches_name_idx" ON "coaches"("name");

-- CreateIndex
CREATE INDEX "coaches_status_idx" ON "coaches"("status");

-- CreateIndex
CREATE INDEX "courses_start_time_idx" ON "courses"("start_time");

-- CreateIndex
CREATE INDEX "courses_coach_id_idx" ON "courses"("coach_id");

-- CreateIndex
CREATE INDEX "attendances_student_id_idx" ON "attendances"("student_id");

-- CreateIndex
CREATE INDEX "attendances_course_id_idx" ON "attendances"("course_id");

-- CreateIndex
CREATE UNIQUE INDEX "attendances_course_id_student_id_attendance_date_key" ON "attendances"("course_id", "student_id", "attendance_date");

-- CreateIndex
CREATE INDEX "gradings_student_id_exam_date_idx" ON "gradings"("student_id", "exam_date");

-- CreateIndex
CREATE INDEX "competitions_student_id_idx" ON "competitions"("student_id");

-- CreateIndex
CREATE INDEX "camps_student_id_idx" ON "camps"("student_id");

-- AddForeignKey
ALTER TABLE "courses" ADD CONSTRAINT "courses_coach_id_fkey" FOREIGN KEY ("coach_id") REFERENCES "coaches"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_course_id_fkey" FOREIGN KEY ("course_id") REFERENCES "courses"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "gradings" ADD CONSTRAINT "gradings_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "competitions" ADD CONSTRAINT "competitions_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "camps" ADD CONSTRAINT "camps_student_id_fkey" FOREIGN KEY ("student_id") REFERENCES "students"("id") ON DELETE CASCADE ON UPDATE CASCADE;
