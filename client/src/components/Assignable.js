import React, { Component } from "react";
import Paper from "material-ui/Paper";
import { DragSource } from "react-dnd";

const assignableSource = {
	beginDrag(props) {
		const item = { id: props.resource._id, type: props.type };
		return item;
	},

	endDrag(props, monitor, component) {
		if (!monitor.didDrop()) {
			return;
		}

		// Do some animation stuff I guess?
	}
};

function collect(connect, monitor) {
	return {
		connectDragSource: connect.dragSource(),
		connectDragPreview: connect.dragPreview(),
		isDragging: monitor.isDragging()
	};
}

class Assignable extends Component {
	constructor() {
		super();
	}

	render() {
		const {
			type,
			resource,
			connectDragPreview,
			connectDragSource
		} = this.props;

		connectDragPreview(<i className="fa fa-tasks" aria-hidden="true" />);

		return connectDragSource(
			<div>
				<Paper>
					<div className="task-card">
						<h4>{resource.title}</h4>
						<p>{resource.description}</p>
					</div>
				</Paper>
			</div>
		);
	}
}

export default DragSource("assignable", assignableSource, collect)(Assignable);
