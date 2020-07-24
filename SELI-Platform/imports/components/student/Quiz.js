import React, { Component } from 'react';
import Button from '@material-ui/core/Button';
import Paper from '@material-ui/core/Paper';
import Divider from '@material-ui/core/Divider';
import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';
import WarningIcon from '@material-ui/icons/Warning';
import Radio from '@material-ui/core/Radio';
import RadioGroup from '@material-ui/core/RadioGroup';
import FormHelperText from '@material-ui/core/FormHelperText';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import FormControl from '@material-ui/core/FormControl';
import FormLabel from '@material-ui/core/FormLabel';
import CircularProgress from '@material-ui/core/CircularProgress';
import QuestionAnswerIcon from '@material-ui/icons/QuestionAnswer';
import TimerMachine from 'react-timer-machine'
import { withStyles } from '@material-ui/core/styles';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import LinearProgress from '@material-ui/core/LinearProgress';
import Select from '@material-ui/core/Select';
import moment, { min } from "moment";
import momentDurationFormatSetup from "moment-duration-format";
import Checkbox from '@material-ui/core/Checkbox';
import CourseFilesCollection from '../../../lib/CourseFilesCollection';
import { Courses } from '../../../lib/CourseCollection';
const bakery = require('openbadges-bakery-v2');
var key = Meteor.settings.public.BLOCKCHAIN_USERKEY;
var encryptor = require('simple-encryptor')(key);
momentDurationFormatSetup(moment);
const useStyles = theme => ({
  root: {
    width: '79%',
    '& > * + *': {
      marginTop: theme.spacing(2),
    },
  },
  button: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  formControl: {
    margin: theme.spacing(1),
    minWidth: 120,
  },
});


class Quiz extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selected: 0,
      answers: [], //should be load at start of the component
      panelshow: '',
      age: '',
      open: false,
      alert: '',
      answertest: false,
      average: '',
      successTrue: '',
      Incorrect: '',
      extraTime: false,
      start: false,
      alertTimeValue: '',
      handleTick: '',
      extendedTime: "",
      newaddTime: "",
      selectedtime: '',
      noTime: false
    }
  }

  componentDidMount() {
    console.log("datos de quiz", this.props)
    this.setState({
      start: false,
      // selectedtime: this.props.quiz.attributes.extendtime
    })
    //configure warningalerts must consider default alerts and teacher alerts
    if (this.props.time > 0) {
      if (this.props.quiz.attributes.accessibility.isA11Y === undefined) {
        let timeLimit = ((this.props.time) / (60 * 1000))
        if (timeLimit > 19) {
          this.setState({ alertTimeValue: 10 })
        } else {
          this.setState({ alertTimeValue: (timeLimit / 2) })
        }
      } else {//when is no undefined
        if (this.props.quiz.attributes.accessibility.isA11Y[1].is_a11y === true) {
          this.setState({
            extraTime: true, //see if there is extra time and put it into the state
            extendedTime: this.props.quiz.attributes.accessibility.dataField.extendedTimeValue, // in th for "hh:mm:ss"

          })
        }
        if (this.props.quiz.attributes.accessibility.isA11Y[0].is_a11y === true) {
          this.setState({
            noTime: true
          })
        }
        if (this.props.quiz.attributes.accessibility.isA11Y[2].is_a11y === false) {//when warning alert is false
          console.log("paso3")
          let timeLimit = ((this.props.time) / (60 * 1000))
          if (timeLimit > 19) {
            this.setState({ alertTimeValue: 10 })
          } else {
            this.setState({ alertTimeValue: (timeLimit / 2) })
          }
        }
        else { //when is_a11y true
          let warning = this.props.quiz.attributes.accessibility.dataField.warningAlertValue.split(":")
          let warningtime = (parseInt(warning[0]) * 60 + parseInt(warning[1]) + (parseInt(warning[2]) / 60))
          this.setState({ alertTimeValue: warningtime })
        }
      }
    } else { //time is zero we need without time for all students
      this.setState({
        panelshow: 'stop'
      })
    }

  }
  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedtime !== this.state.selectedtime) {
      this.setState({ start: false })

    }
  }

  componentWillMount() {
    let answers = this.state.answers;
    let controlAnswers = this.state.controlAnswers;
    let questions = this.props.quiz.attributes.questions;

    questions.map(question => {
      let answerlength = question.correctAnswers.length;
      answers.push(Array.apply(null, new Array(answerlength)).map(Boolean.prototype.valueOf, false));
    })
    this.setState({
      answers: answers,
      panelshow: this.props.time,
      selectedtime: this.props.time
    });
  }

  handleChange = (check, event) => {
    let answers = this.state.answers;
    answers[this.state.selected][check] = event.target.checked;
    this.setState({
      answers: answers,
    });
  }

  handlePrevious = () => {
    let selected = this.state.selected;
    selected--;
    this.setState({
      selected: selected,
      answer: '',
    })
  }

  handleNext = () => {
    let selected = this.state.selected;
    selected++;
    this.setState({
      selected: selected,
      answer: '',
    })
  }

  validateQuiz = () => {
    for (var i = 0; i < this.state.answers.length; i++) {
      if (this.state.answers[i] === '') {
        this.props.handleControlMessage(true, this.props.language.questionsWithoutAnswers);
        return false;
      }
    }
    return true;

  }

  getQuizResults = (answers) => {
    let hits = [];
    let success = 0;
    let successTrue = 0;
    let Incorrect = 0;
    let appprovalPercentage = 0;
    let average = 0;
    let NumberAnswers = 0;
    let TotalAverage = 0;
    let TotalCorrectTrue = 0;
    let TotalIncorrect = 0;
    // console.log("Answers de llegada", answers)
    //console.log("Answers verdaderas",this.props.quiz.attributes.questions)
    answers.map(((answersgroup, index) => {
      success = 0;
      successTrue = 0;
      Incorrect = 0;
      NumberAnswers = 0;
      average = 0
      answersgroup.map((IndividualAnswer, Individualindex) => {
        NumberAnswers++
        if (IndividualAnswer === this.props.quiz.attributes.questions[index].correctAnswers[Individualindex]) {
          success++;
          // console.log("Coincide para prgunta ", index, "answer ", Individualindex,"exitos ",success  )
          if ((IndividualAnswer && this.props.quiz.attributes.questions[index].correctAnswers[Individualindex]) === true) {
            successTrue++;
          }
        } else if (IndividualAnswer === true && this.props.quiz.attributes.questions[index].correctAnswers[Individualindex] === false) {
          Incorrect++;
        }
      })
      //calculate score
      if (NumberAnswers === success) { //all answers correct
        //console.log("100% Bien")
        average = 100;
      } else if ((successTrue === 0) || (successTrue === Incorrect)) { //all answers incorrect
        //console.log("0% mal")
        average = 0;
      } else if ((Incorrect - successTrue) > 0) {
        //console.log("0% mal")
        average = 0;
      } else if ((Incorrect - successTrue) < 0) {
        let correctquiz = (this.props.quiz.attributes.questions[index].correctAnswers.filter(x => x == true).length)
        //console.log(correctquiz)
        average = (((successTrue - Incorrect) * 100) / correctquiz)
        // console.log("Se calcula:", average)
      }
      TotalAverage = average + TotalAverage;
      TotalCorrectTrue = successTrue + TotalCorrectTrue;
      TotalIncorrect = Incorrect + TotalIncorrect;

    }))
    TotalAverage = (TotalAverage / answers.length)
    console.log("total", TotalAverage, TotalCorrectTrue, TotalIncorrect)
    return ({ score: TotalAverage, hits: TotalCorrectTrue, Incorrect: TotalIncorrect, answers: answers, trueAnswers: this.props.quiz.attributes.questions });
  }

  handleFinish = (validate, type) => {
    if (validate) {
      if (this.validateQuiz()) { // always validate inclusive without any question resolved
        let results = this.getQuizResults(this.state.answers);
        let approved;

        results.score >= this.props.quiz.attributes.approvalPercentage ? approved = true : approved = false;
        let quiz = {
          score: results.score,
          hits: results.hits,
          approved: approved,
          public: false,
          type: 'quiz',
          Incorrect: results.Incorrect,
          answers: results.answers,
          trueAnswers: results.trueAnswers
        }
        this.props.completeActivity(this.props.quiz.id, quiz);
      }
    }
    else {
      let score = this.getQuizResults(this.state.answers);
      let approved;
      score >= this.props.quiz.attributes.approvalPercentage ? approved = true : approved = false;
      let quiz = {
        score: results.score,
        hits: results.hits,
        approved: approved,
        public: false,
        type: 'quiz',
        Incorrect: results.Incorrect,
        answers: results.answers,
        trueAnswers: results.trueAnswers
      }
      this.props.completeActivity(this.props.quiz.id, quiz);
    }
    this.props.handleClose();
    let score = this.getQuizResults(this.state.answers);
    console.log(score.score);
    console.log(this.props.quiz.attributes.approvalPercentage);
    if (score.score >= this.props.quiz.attributes.approvalPercentage) {
      console.log('baking after succesful quiz');
      let badgeInformation = this.props.quiz.attributes.badgeInformation;
      this.issueBadge(badgeInformation);
      // Meteor.call("UpdateCourses", Meteor.userId, user.profile.b);
    }
    else {
      console.log("no approved");
    }
    let approved;
    score >= this.props.quiz.attributes.approvalPercentage ? approved = true : approved = false;
    console.log(approved);
    //adding badge
    // this.persistBadge(this.props.quiz.attributes.badgeInformation);

  }

  showFinishConfirmation = () => {
    this.setState({
      showFinishConfirmation: true,
    })
  }

  cancelFinish = () => {
    this.setState({
      showFinishConfirmation: false,
    })
  }

  handleTick = (time) => {
    let progress;
    let fullTime = this.props.time;
    let seconds = time.s;
    let minutes = time.m;
    let hours = time.h;
    time = seconds + minutes * 60 + hours * 3600;
    progress = (100 * time) / (fullTime / 1000);
    this.setState({
      progress: progress,
      handleTick: time
    })
    if (time === (this.state.alertTimeValue * 60)) {
      this.setState({
        alert: 'alert',
        open: true,
      })
    }


  }

  stoptime = () => {
    this.setState({
      panelshow: 'stop'
    })
  }

  adjust = () => {
    this.setState({
      panelshow: 'adjust'
    })
  }



  closeExtraTime = () => {
    this.setState({
      panelshow: 'exitExtraTime'
    })
  }


  handleClose = () => {
    this.setState({
      open: false
    })
    console.log("se cerro")
  };

  handleOpen = () => {
    this.setState({
      open: true
    })
    //console.log("se abrio")
  };

  cambio = () => {
    const { classes } = this.props;
    return (
      <div key={this.state.selectedtime}>
        <TimerMachine
          timeStart={this.state.selectedtime} // start at 10 seconds
          timeEnd={0}       // end at 20 seconds
          started={true}
          paused={this.state.start}//false
          countdown={true}  // use as stopwatch
          interval={1000}   // tick every 1 second
          formatTimer={(time, ms) =>
            moment.duration(ms, "milliseconds").format("hh:mm:ss", {
              trim: false
            })
          }
          onTick={time =>
            this.handleTick(time)
          }
          onComplete={time =>
            this.handleFinish(true, "finish")
          }
        />
        <div className={classes.root}>
          <LinearProgress />
          <LinearProgress color="secondary" />
        </div>
      </div>
    )

  }
  alerta = () => {
    return (
      <Dialog
        open={this.state.open}
        onClose={this.handleClose}
        aria-labelledby="alert-dialog-confirmation"
        aria-describedby="alert-dialog-confirmation"
      >
        <DialogTitle tabIndex="-1" className="success-dialog-title" id="alert-dialog-title">{this.props.language.warningTime}</DialogTitle>
        <DialogContent tabIndex="-1" className="success-dialog-content">
          <DialogContentText tabIndex="-1" className="success-dialog-content-text" id="alert-dialog-description">
            {this.state.dialogConfirmationContentText}
          </DialogContentText>
          <WarningIcon tabIndex="-1" className="warning-dialog-icon" />
        </DialogContent>
        <DialogActions>
          {
            (this.state.extraTime === true && this.state.panelshow != 'adjust') ?
              <Button onClick={() => this.handleMoreTime()} variant="contained" color="primary" className="bar-button">{this.props.language.moreTime}</Button>
              :
              undefined
          }
          <Button onClick={() => this.handleClosepublish()} color="primary" autoFocus>
            {this.props.language.continue}
          </Button>
        </DialogActions>
      </Dialog>
    )
  }
  handleClosepublish = () => {
    this.setState({ alert: 'cierra' });
  }
  handleMoreTime = () => {

    this.setState({
      alert: 'cierra',//nf
      open: false,
      panelshow: 'adjust',
      extraTime: false
    });
    //add more time
    let extendedtime = (this.state.extendedTime.split(":"))
    let moreTime = (this.state.handleTick + (parseInt(extendedtime[0]) * 60 * 60) + (parseInt(extendedtime[1]) * 60) + parseInt(extendedtime[2])) //seconds
    this.setState({ selectedtime: moreTime * 1000 })

  }

  // OpenBadge

  async bake(options) {
    return new Promise((resolve, reject) => {
      bakery.bake(options, function (err, data) {
        if (err)
          return reject(err)
        else
          resolve(data);
      })
    })

  }
  async saveBadge(data, image) {
    let user = Meteor.users.find({ _id: Meteor.userId() }).fetch();
    user = user[0];
    var file = new File([data], image._id + ".png", {
      type: "image/png",
      ext: "png",
      extension: "png",
      extensionWithDot: ".png"
    });
    let uploadInstance = CourseFilesCollection.insert({
      file: file,
      meta: {
        locator: '',
        dateAdded: new Date(),
        isFavorite: false,
        usedInCourse: false,
        userId: '',
        buffer: '',
        //userId: Meteor.userId() // Optional, used to check on server for file tampering
      },
      streams: 'dynamic',
      chunkSize: 'dynamic',
      allowWebWorkers: true // If you see issues with uploads, change this to false
    }, false)

    uploadInstance.start();
    console.log(file);
    console.log(uploadInstance);
    let currentId = uploadInstance.config.fileId + "";
    let newName = uploadInstance.config.fileId + ".jpg";
    console.log(currentId);
    console.log(newName);
    let today = new Date();
    let certificateInfo = {
      idStudent: user._id,
      name: user.profile.fullname,
      tutor: 'Maestro',
      date: today.getDate() + '-' + (today.getMonth() + 1) + '-' + today.getFullYear(),
      course: this.props.quiz.attributes.badgeInformation.name,
      description: this.props.quiz.attributes.badgeInformation.description,
      duration: '10',
    };
    if (this._isMounted) {
      this.setState({ badgeWin: true });
    }
    console.log(this.state);
    this.saveUserBadge();
  }
  saveUserBadge = () => {
    console.log('saving user badge in collection');
    Meteor.call('addBadgeStudent',
      Meteor.userId(),
      this.props.quiz.attributes.badgeInformation,
      (error, response) => { }
    )
  };


  async issueBadge(badgeInformation) {
    console.log("issueBadge :  badgeInformation")
    console.log(badgeInformation);
    let user = Meteor.users.find({ _id: Meteor.userId() }).fetch();
    user = user[0];
    console.log("user")
    console.log(user.profile.fullname);
    console.log(this.props.quiz.id);//0.517584894190696
    let course = Courses.find({ "program.items.id": this.props.quiz.id }).fetch();
    course = course[0];
    console.log(course);
    let buffer = CourseFilesCollection.findOne({ _id: badgeInformation.image._id });
    buffer = buffer.meta.buffer;
    var theAssertion = {
      "_id": badgeInformation.image._id,
      "_badgeName": badgeInformation.name,
      "_studentName": user.profile.fullname,
      "_courseId": course._id,
      "_teacherId": course.createdBy,
      "description": badgeInformation.description,
      "issuedOn": new Date().toISOString().substring(0, 10),
    };
    console.log(theAssertion);
    var options = {
      image: buffer,
      assertion: theAssertion,
    };
    let registerDataSinCode = { //useful for regsiter users in blockchain network
      email: (user.emails)[0].address,
      displayName: user.profile.fullname,
      password: Meteor.userId()
    }
    console.log(registerDataSinCode)

    await this.bake(options)
      .then(data => {
        this.saveBadge(data, badgeInformation.image);
        this.setState({ badgeWin: true });
        var registerData = { data: encryptor.encrypt(registerDataSinCode) };
        this.persistBadge(theAssertion, registerData);
      })
      .catch(err => { console.log(err) })
  }
  persistBadge(badgeInfo, registerData) {
    console.log('sending badge to blockchain')
    console.log(JSON.stringify(badgeInfo))
    let tokenUser = Meteor.users.find({ _id: Meteor.userId() }).fetch()[0].profile.token;

    if (tokenUser === undefined) {//register the token
      fetch('http://localhost:80/login/user', {
        method: 'post',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerData)
      }).then(res => res.json()).then(res => {
        console.log("Respuesta del registro o token: ", res);
        Meteor.users.update(
          { _id: res.idStudent },
          {
            $push:
              { "profile.token": res.token }
          }
        );

        fetch('http://localhost:80/badges/issue', {
          method: 'post',
          headers: {
            'Accept': 'application/json, text/plain, */*',
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${res.token}`
          },
          body: JSON.stringify(badgeInfo)
        }).then(res => res.json())
          .then(res => {
            console.log(res);
          });

      })
    }
    else {
      fetch('http://localhost:80/badges/issue', {
        method: 'post',
        headers: {
          'Accept': 'application/json, text/plain, */*',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${tokenUser}`
        },
        body: JSON.stringify(badgeInfo)
      }).then(res => res.json())
        .then(res => {
          console.log(res);
        });
    }
  }


  render() {
    const { classes } = this.props;

    return (
      <div className="quiz-dashboard-container">
        {
          Number.isNaN(this.state.selectedtime) || this.state.panelshow === 'stop' ?
            undefined
            :
            <Paper elevation={10} className="quiz-dashboard-side" >
              <h2 className="quiz-dashboard-primary-text">{this.props.quiz.attributes.quizTitle}</h2>
              <QuestionAnswerIcon className="quiz-dashboard-icon" />
              <p className="quiz-dashboard-label-text">{this.props.language.timeLeft}</p>
              {
                this.cambio()
              }

              {
                this.state.extraTime === true ?
                  <Button onClick={() => this.handleMoreTime()} variant="contained" color="primary" className="bar-button1">{this.props.language.moreTime}</Button>
                  :
                  undefined
              }

              {
                (this.state.panelshow === 'adjust' && this.state.extraTime === true) ?
                  <div className="more-time alert">
                    <DialogTitle className="success-dialog-title" id="alert-dialog-title">
                      A time of {this.props.quiz.attributes.accessibility.dataField.extendedTimeValue} was assigned *
                </DialogTitle>
                    <div className="center-row">
                    </div>

                  </div>
                  :
                  undefined
              }

              {//option for no time
                this.state.noTime === true ?
                  <Button onClick={() => this.stoptime()} className="course-item-video-card-media-button">{this.props.language.stopTime}</Button>
                  :
                  undefined
              }
            </Paper>
        }
        {
          this.state.alert === 'alert' ?
            this.alerta()
            :
            undefined
        }
        <Paper elevation={8} className="quiz-dashboard-questions-container">
          <p className="question-dashboard-label-text">{this.props.language.chooseCorrectAnswer}</p>
          <Divider />
          <div className="question-dashboard-container">
            <FormControl component="fieldset" className="question-dashboard-form-control">
              <h3 component="legend" className="question-dashboard-form-label MuiFormLabel-root question-dashboard-form-label">{this.props.quiz.attributes.questions[this.state.selected].questionTitle}</h3>
              <RadioGroup
                aria-label="answer"
                name="answer"
                className="question-dashboard-radio-group-student"
                aria-required="true"
              >
                {
                  this.props.quiz.attributes.questions[this.state.selected].answersText.map((text, index) => {
                    return (
                      <FormControlLabel
                        control={
                          <Checkbox
                            className={"question-dashboard-form-control-label"}
                            checked={this.state.answers[this.state.selected][index] === true}
                            onChange={() => this.handleChange(index, event)}
                            inputProps={{
                              'aria-label': 'primary checkbox',
                            }}
                          />
                        }
                        label={text}
                      />
                    )
                  })
                }
              </RadioGroup>
            </FormControl>
          </div>
          {
            this.state.showFinishConfirmation ?
              <div className="question-dashboard-actions">
                <p className="question-dashboard-label-text">{this.props.language.sureFinishQuiz}</p>
                <Button
                  className="question-dashboard-button"
                  color="primary"
                  onClick={() => this.cancelFinish()}
                >
                  {this.props.language.no}
                </Button>
                <Button
                  className="question-dashboard-button"
                  color="primary"
                  onClick={() => this.handleFinish(true, "finish")}
                >
                  {this.props.language.yes}
                </Button>
              </div>
              :
              <div className="question-dashboard-actions">
                {
                  this.state.selected === 0 ?
                    undefined
                    :
                    <Button
                      className="question-dashboard-button"
                      color="primary"
                      variant="contained"
                      onClick={() => this.handlePrevious()}
                    >
                      {this.props.language.previousStep}
                    </Button>
                }
                {
                  this.state.selected === this.props.quiz.attributes.questions.length - 1 ?
                    <Button
                      className="question-dashboard-button"
                      color="primary"
                      variant="contained"
                      onClick={() => this.showFinishConfirmation()}
                    >
                      {this.props.language.finish}
                    </Button>
                    :
                    <Button
                      className="question-dashboard-button"
                      color="primary"
                      variant="contained"
                      onClick={() => this.handleNext()}
                    >
                      {this.props.language.next}
                    </Button>
                }
              </div>
          }
        </Paper>
      </div>
    )
  }
}

export default withStyles(useStyles)(Quiz)