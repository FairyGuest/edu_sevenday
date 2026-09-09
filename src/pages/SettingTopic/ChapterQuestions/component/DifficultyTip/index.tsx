export const DifficultyTip = () => (
  <div className="difficulty_tip_box">
    <span className="title">试卷难度</span>
    <div className="difficulty_list">
      <div className="difficulty_item">
        <span className="difficulty_item_label">容易</span>
        <div className="difficulty_item_progress">
          <div style={{ width: "50%" }} className="col easy">
            50%
          </div>
          <div style={{ width: "30%" }} className="col littleSimple">
            30%
          </div>
          <div style={{ width: "20%" }} className="col medium">
            20%
          </div>
        </div>
      </div>
      <div className="difficulty_item">
        <span className="difficulty_item_label">较易</span>
        <div className="difficulty_item_progress">
          <div style={{ width: "30%" }} className="col easy">
            30%
          </div>
          <div style={{ width: "30%" }} className="col littleSimple">
            30%
          </div>
          <div style={{ width: "40%" }} className="col medium">
            40%
          </div>
        </div>
      </div>
      <div className="difficulty_item">
        <span className="difficulty_item_label">适中</span>
        <div className="difficulty_item_progress">
          <div style={{ width: "50%" }} className="col littleSimple">
            50%
          </div>
          <div style={{ width: "30%" }} className="col medium">
            30%
          </div>
          <div style={{ width: "20%" }} className="col littleHard">
            20%
          </div>
        </div>
      </div>
      <div className="difficulty_item">
        <span className="difficulty_item_label">较难</span>
        <div className="difficulty_item_progress">
          <div style={{ width: "20%" }} className="col littleSimple">
            20%
          </div>
          <div style={{ width: "50%" }} className="col medium">
            50%
          </div>
          <div style={{ width: "30%" }} className="col littleHard">
            30%
          </div>
        </div>
      </div>
      <div className="difficulty_item">
        <span className="difficulty_item_label">困难</span>
        <div className="difficulty_item_progress">
          <div style={{ width: "50%" }} className="col medium">
            50%
          </div>
          <div style={{ width: "30%" }} className="col littleHard">
            30%
          </div>
          <div style={{ width: "20%" }} className="col hard">
            20%
          </div>
        </div>
      </div>
    </div>
    <div className="difficulty_tip_box_footer">
      <div className="item">
        <span className="point easy" />
        容易题目
      </div>
      <div className="item">
        <span className="point littleSimple" />
        较易题目
      </div>
      <div className="item">
        <span className="point medium" />
        适中题目
      </div>
      <div className="item">
        <span className="point littleHard" />
        较难题目
      </div>
      <div className="item">
        <span className="point hard" />
        困难题目
      </div>
    </div>
  </div>
);

export default DifficultyTip;
