//TODO: SPLIT THIS UP INTO ONE CONTAINER AND TWO COMPONENTS

import React from "react";
import { connect } from "react-redux";

//components
import { Card, CardHeader, CardText } from "material-ui/Card";
import { List, ListItem } from "material-ui/List";
import Undoable from "../../GlobalComponents/Undoable";
import LoadScreen from "../../GlobalComponents/LoadScreen";
import Paper from "material-ui/Paper";
import FlatButton from "material-ui/FlatButton";
import "./SRewardList.css";

//actions
import {
  redeemReward,
  createReward,
  getAllRewards,
  editReward,
  deleteReward
} from "../../../redux/actions/rewards";
import { getStudentRewardOptions } from "../../../redux/actions/rewardOptions";
import { loginTeacher, loginStudent } from "../../../redux/actions/index";

class StudentRewards extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingRewards: false,
      loading: true
    };
  }
  //grab all the rewards
  getRewards = async () => {
    await this.props.getStudentRewardOptions(this.props.classrooms);
    this.setState({
      fetchingRewards: false,
      loading: false
    });
  };
  onPurchase = rewardId => {
    this.props.redeemReward(this.props.user.id, rewardId);
  };

  render = () => {
    if (this.state.loading) {
      if (
        Object.keys(this.props.user).length !== 0 &&
        !this.state.fetchingRewards
      ) {
        //go fetch some data
        this.getRewards();
      }
      //display load screen
      return <LoadScreen />;
    }

    //TODO: ADD IN-PLACE EDITING FOR DESCRIPTION/ COST/VALUE
    //TODO: ADD A RADIO-BUTTON TO CHANGE THE AVAILABILITY SETTINGS
    /////////IF THE USER IS THE TEACHER
    const rewards = this.props.rewardOptions.map(reward => {
      return (
        <Card
          className="reward-container"
          style={{ backgroundColor: "#D8F996" }}
        >
          <CardHeader
            title={reward.title}
            subtitle={`costs ${reward.cost || reward.value || "None"}`}
            className="reward-card-header"
            actAsExpander={true}
          />
          <CardText
            className="reward-item"
            style={{ hoverColor: "none" }}
            expandable={true}
          >
            <Paper style={{ padding: "20px" }}>
              <p>Description: {reward.description || "None"}</p>
              <p>Kind of reward: {reward.cost ? "Loot" : "Point"}</p>
              <p>Cost: {reward.cost || reward.value || "None"}</p>
              <p>Available: {reward.available ? "YES" : "NO"}</p>
              <p>Supply: {reward.supply || "Unlimited"}</p>
              <Undoable
                disabled={this.props.user.points < reward.cost ? true : false}
                resolve={() => this.onPurchase(reward._id)}
                wait={2}
              >
                <FlatButton
                  // onClick={() => this.onPurchase(reward)}
                  disabled={this.props.user.points < reward.cost ? true : false}
                  primary={this.props.user.points > reward.cost ? true : false}
                  label="purchase"
                />
              </Undoable>
            </Paper>
          </CardText>
        </Card>
      );
    });
    return (
      <Paper className="reward-container center">
        {/* header */}
        <div className="reward-card-title">
          <h1>{this.props.user.displayName}'s Rewards</h1>
          <h5>Your points</h5>
          <h5>{this.props.user.points}</h5>
          <FlatButton label="Get More" onClick={this.getMoarPoints} />
        </div>
        {/* Rewards List */}
        <List className="reward-list">{rewards}</List>
      </Paper>
    );
  };
}

const mapStateToProps = state => {
  return {
    user: state.user,
    rewards: state.rewards,
    classrooms: state.classrooms,
    rewardOptions: state.rewardOptions
  };
};
const mapDispatchToProps = dispatch => {
  return {
    createReward: teacher => {
      dispatch(createReward(teacher));
    },
    fetchRewards: (userId, userKind) => {
      dispatch(getAllRewards(userId, userKind));
    },
    removeReward: rewardId => {
      dispatch(deleteReward(rewardId));
    },
    updateReward: (id, editedReward) => {
      dispatch(editReward(id, editedReward));
    },
    getStudentRewardOptions: classrooms => {
      dispatch(getStudentRewardOptions(classrooms));
    },
    redeemReward: (studentId, rewardId) => {
      dispatch(redeemReward(studentId, rewardId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(StudentRewards);
