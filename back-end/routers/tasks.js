const router = require('express').Router();
const { Task, User, Student } = require('../models');
const { createResponse } = require('../server/util');
const { getResource, logEvent, logError } = require('../server/util');
const { TaskEvent, MessageEvent, Messages } = require('../models/events');

// creating a task
router.post('/', async (req, res) => {
	try {
		const {
			title,
			description,
			rewards,
			teacher,
			classroom,
			status
		} = req.body;
		if (!title || !description) {
			throw new Error('No title or description supplied.');
		}
		const task = new Task({
			title,
			description,
			rewards,
			teacher,
			classroom,
			status
		});
		let promises = [];
		teacher = await User.findById(teacher);
		teacher.tasks.push(task);
		promises.push(teacher.save());
		promises.push(task.save());

		// Create log event.
		logEvent(
			TaskEvent,
			{
				message: Messages.TEMPLATE_TASK_CREATE,
				owner: req.user,
				task
			},
			false
		);

		await Promise.all(promises);
		res.json(createResponse(task));
	} catch (error) {
		logError(error);
		res.json(createResponse(error));
	}
});

// reading a task
router.get('/:id', async (req, res) => {
	try {
		const task = await getResource(req.params.id, Task.findById.bind(Task));

		// Create log event.
		logEvent(TaskEvent, {
			message: Messages.TEMPLATE_TASK_READ,
			owner: req.user,
			task
		});

		res.json(createResponse(task));
	} catch (error) {
		logError(error);
		res.json(createResponse(error));
	}
});

// reading a task's students
router.get('/:id/students', async (req, res) => {
	try {
		const task = await getResource(req.params.id, Task.findById.bind(Task));
		// Create log event.
		console.log(task.students);
		task.studentList = task.students.join(',');
		console.log(task.studentList);
		logEvent(TaskEvent, {
			message: Messages.TEMPLATE_TASK_STUDENT_READ,
			owner: req.user,
			task
		});

		res.json(createResponse(task.students));
	} catch (error) {
		logError(error);
		res.json(createResponse(error));
	}
});

// updating a task
router.patch('/:id', async (req, res) => {
	try {
		let { updates, message } = req.body;
		if (!updates) {
			updates = req.session.body.updates;
			delete req.session.body;
		}
		const task = await getResource(
			req.params.id,
			Task.findByIdAndUpdate.bind(Task),
			updates
		);

		if (updates.teacher) {
			let teacher = User.findById(updates.teacher);
			teacher.tasks.push(task);
			await teacher.save();
		}

		task.fields = Object.keys(updates).join(',');
		task.values = Object.values(updates).join(',');
		logEvent(TaskEvent, {
			message: Messages.TEMPLATE_TASK_UPDATE,
			owner: req.user,
			task
		});
		if (updates.statues && updates.statues === 'complete' && message) {
			logEvent(
				MessageEvent,
				{
					message: Messages.TEMPLATE_SEND_MESSAGE,
					owner: req.user,
					user: task.teacher,
					body: message,
					task
				},
				false
			);
		}
		res.json(createResponse(task));
	} catch (error) {
		logError(error);
		res.json(createResponse(error));
	}
});

router.patch('/:id/assign/:s_id', async (req, res) => {
	try {
		// Get the task.
		const task = await getResource(req.params.id, Task.findById.bind(Task));

		// Get the student.
		const student = await getResource(
			req.params.s_id,
			Student.findById.bind(Student)
		);

		if (task.hasStudent(student)) {
			// Check the student for the corresponding task.
			if (!student.hasTask(task)) {
				// Add the task to the student's task list.
				student.tasks.push(task);
				await student.save();
			}
			throw new Error('Task already assigned to student');
		}

		// Create log event.
		logEvent(TaskEvent, {
			message: Messages.TEMPLATE_TASK_ASSIGN,
			owner: req.user,
			user: student,
			task
		});

		req.session.body = {
			updates: {
				students: student
			}
		};
		res.redirect(`/api/tasks/${req.params.id}`);
	} catch (error) {
		logError(error);
		res.json(createResponse(error));
	}
});

router.delete('/:id', async (req, res) => {
	try {
		const task = await getResource(req.params.id, Task.findByIdAndRemove(Task));
		res.json(createResponse(task));
	} catch (error) {
		logError(error);
		res.json(createResponse(error));
	}
});

module.exports = router;
