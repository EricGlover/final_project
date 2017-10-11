//TODO: SPLIT THIS UP INTO ONE CONTAINER AND TWO COMPONENTS

import React from "react";
import { connect } from "react-redux";

//components
import CreateRewardModal from "./TCreateRewardModal";
import Undoable from "../../GlobalComponents/Undoable";
import Editable from "../../GlobalComponents/Editable";
import LoadScreen from "../../GlobalComponents/LoadScreen";
import { Card, CardHeader, CardText } from "material-ui/Card";
import { List, ListItem } from "material-ui/List";
import Paper from "material-ui/Paper";
import RaisedButton from "material-ui/RaisedButton";
import TEditRewardModal from "./TEditRewardModal";
import "../../Styles/RewardList.css";
import TRewardCard from "./TRewardCard";

//actions
import {
  createReward,
  getAllRewards,
  editReward,
  deleteReward
} from "../../../redux/actions/rewards";
import { loginTeacher, loginStudent } from "../../../redux/actions/index";

class TeacherRewardList extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      fetchingRewards: false,
      loading: true
    };
  }

  async componentDidMount() {
    await this.props.fetchRewards(this.props.user.id, this.props.user.kind);
    this.setState({
      fetchingRewards: false,
      loading: false
    });
  }

  onCreateReward = async rewardInput => {
    this.props.createReward(this.props.user.id, rewardInput);
  };
  //change the availability of a reward
  onToggleAvailability = async reward => {
    reward.available = !reward.available;
    this.props.updateReward(reward._id, {
      updates: { available: reward.available }
    });
  };
  onEditReward = async (updatedReward, id) => {
    if (updatedReward.cost === undefined) delete updatedReward.cost;
    if (updatedReward.value === undefined) delete updatedReward.value;
    this.props.updateReward(id, { updates: updatedReward });
  };
  render = () => {
    if (this.state.loading) {
      return <LoadScreen />;
    }

    //TODO: ADD A RADIO-BUTTON TO CHANGE THE AVAILABILITY SETTINGS
    //THE REWARDS CARDS ////
    const rewards = this.props.rewards.map(reward => {
      return (
        <TRewardCard
          reward={reward}
          onEditReward={this.onEditReward}
          onToggleAvailability={this.onToggleAvailability}
        />
      );
    });
    return (
      <div className="reward-container-outer">
        <h1>Your Rewards</h1>
        <Paper
          className="dashboard-menu"
          style={{
            padding: "4px",
            borderRadius: "20px"
          }}
          zDepth={5}
          rounded={true}
        >
          <div
            className="reward-container"
            style={{
              border: "5px dashed #ccc",
              borderRadius: "20px"
            }}
          >
            {/* header */}
            {/* <div className="reward-card-title">
              <h2>{this.props.user.displayName}'s Rewards</h2>
               <CreateRewardModal onSubmit={this.onCreateReward} />

            </div> */}
            {/* Rewards List */}
            {rewards}
          </div>
        </Paper>
      </div>
    );
  };
}

const mapStateToProps = (state, ownProps) => {
  return {
    ...ownProps,
    rewards: state.rewards,
    classrooms: state.classrooms
  };
};
const mapDispatchToProps = dispatch => {
  return {
    createReward: (teacher, rewardInput) => {
      dispatch(createReward(teacher, rewardInput));
    },
    fetchRewards: (userId, userKind) => {
      dispatch(getAllRewards(userId, userKind));
    },
    removeReward: rewardId => {
      dispatch(deleteReward(rewardId));
    },
    updateReward: (id, updates) => {
      dispatch(editReward(id, updates));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(TeacherRewardList);
