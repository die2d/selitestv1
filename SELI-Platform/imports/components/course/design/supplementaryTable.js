import React, { useState, useEffect } from "react";
import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import Checkbox from "@material-ui/core/Checkbox";
import TextField from "@material-ui/core/TextField";
import IconButton from "@material-ui/core/IconButton";
import AddIcon from "@material-ui/icons/Add";
import Button from "@material-ui/core/Button";
import Paper from "@material-ui/core/Paper";
import Icon from "@material-ui/core/Icon";
import MaterialTable from "material-table";
import InputLabel from "@material-ui/core/InputLabel";
import FormHelperText from "@material-ui/core/FormHelperText";
import FormControl from "@material-ui/core/FormControl";
import Select from "@material-ui/core/Select";
import NativeSelect from "@material-ui/core/NativeSelect";
import FeedbackHelp from "../feedback";
import tableIcons from '../design/icons'

const useStyles = makeStyles(theme => ({}));

export default function SupplementaryTexts(props) {
  useEffect(()=>{
 
    if(type==='lessonInto'){
      let update=state;
      update.data=courseInformation[parentIndex].lessons[lessonIndex].tools[4].items;
      setState(update) 
    }else{
      let update=state;
      update.data=courseInformation[parentIndex].tools[4].items;
     setState(update) 
    }
  },[])

  const {handleSelectResourcesIntoLessons,lessonIndex,type, handleSelectResourcesLessons,courseInformation,handleSelectResources, parentIndex, tools}=props
 

  const classes = useStyles();
;

  const suplementaryItemsTypes = ["paper", "book", "other"];
  const copyTypes = ["printed", "digital"];

  function selectOptions(options) {
    let rows = [];
    for (let [key, value] of Object.entries(options)) {
      // console.log(`${key}: ${value}`);
      rows.push(
        <React.Fragment>
          <option value={key}>{value}</option>
        </React.Fragment>
      );
    }

    return rows;
  }

  const [state, setState] = React.useState({
    columns: [
      {
        title: "Title",
        field: "title",
        editComponent: props => (
          <TextField
            type="text"
            error={
              !props.value &&
              props.rowData.validateInput &&
              props.rowData.submitted
                ? props.rowData.error
                : false
            }
            helperText={
              !props.value &&
              props.rowData.validateInput &&
              props.rowData.submitted
                ? "Required"
                : ""
            }
            value={props.value ? props.value : ""}
            onChange={e => {
              if (props.rowData.validateInput) {
                props.rowData.validateInput = false;
              }

              props.onChange(e.target.value);
            }}
          />
        )
      },
      {
        title: "Type",
        field: "type",
        lookup: suplementaryItemsTypes,
        editComponent: props => {
          return (
            <NativeSelect
              value={props.value ? props.value : ""}
              onChange={e => {
                if (props.rowData.validateInput) {
                  props.rowData.validateInput = false;
                }

                props.onChange(e.target.value);
              }}
              name="suppType"
              inputProps={{
                id: "suppType-"
              }}
            >
              {selectOptions(suplementaryItemsTypes)}
            </NativeSelect>
          );
        }
      },
      {
        title: "Copy Version",
        field: "copy",
        lookup: copyTypes,
        editComponent: props => {
          return (
            <NativeSelect
              value={props.value ? props.value : ""}
              onChange={e => {
                if (props.rowData.validateInput) {
                  props.rowData.validateInput = false;
                }

                props.onChange(e.target.value);
              }}
              name="copyType"
              inputProps={{
                id: "copyType-"
              }}
            >
              {selectOptions(copyTypes)}
            </NativeSelect>
          );
        }
      },
      { title: "External Resource", field: "external", type: "boolean" },
      {
        title: "External URL",
        field: "url",
        editComponent: props => (
          <TextField
            type="url"
            inputProps={{
              pattern:
                "/https?://(www.)?[-a-zA-Z0-9@:%._+~#=]{1,256}.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_+.~#?&//=]*)/"
            }}
            required={!props.rowData.external}
            disabled={!props.rowData.external}
            error={
              props.rowData.external &&
              !props.value &&
              props.rowData.validateInput &&
              props.rowData.submitted
                ? props.rowData.error
                : false
            }
            helperText={
              props.rowData.external &&
              !props.value &&
              props.rowData.validateInput &&
              props.rowData.submitted
                ? "Required"
                : ""
            }
            value={props.value ? props.value : ""}
            onChange={e => {
              if (props.rowData.validateInput) {
                props.rowData.validateInput = false;
              }

              props.onChange(e.target.value);
            }}
          />
        )
      }
    ],
    data: [
     
    ]
  });

  return (
    <React.Fragment>
      <MaterialTable
        title="Supplementary Text"
        options={{ search: true }}
        columns={state.columns}
        data={state.data}
        icons={tableIcons}
        editable={{
          onRowAdd: newData =>
            new Promise((resolve, reject) => {
              newData.submitted = true;
              setTimeout(() => {
              if (!newData.title) {
                newData.error = true;
                newData.label = "required";
                newData.helperText = "Name is required.";
                newData.validateInput = true;
                reject();
                return;
              }
              resolve();
              setState(prevState => {
                const data = [...prevState.data];
                data.push(newData);
                let tool=tools;
                if(type==='lessonInto'){
                  //tool[lessonIndex][4].items=data;
                  handleSelectResourcesIntoLessons(parentIndex,data, lessonIndex, 4)
                }else{
                  tool[4].items=data;
                  handleSelectResources(parentIndex, tool)
                }
                return { ...prevState, data };
              });
               }, 600);
            }),
          onRowUpdate: (newData, oldData) =>
            new Promise((resolve, reject) => {
              setTimeout(() => {
                newData.submitted = true;
                if (!newData.activity) {
                  newData.error = true;
                  newData.label = "required";
                  newData.helperText = "Name is required.";
                  newData.validateInput = true;
                  reject();
                  return;
                }
                resolve();
                if (oldData) {
                  setState(prevState => {
                    const data = [...prevState.data];
                    data[data.indexOf(oldData)] = newData;
                    let tool=tools;
                    tool[lessonIndex].tools[4].items=data;
                    if(type==='lessonInto'){
                      //tool[lessonIndex][4].items=data;
                      handleSelectResourcesIntoLessons(parentIndex,data, lessonIndex, 4)
                    }else{
                      tool[4].items=data;
                      handleSelectResources(parentIndex, tool)
                    }
                    return { ...prevState, data };
                  });
                }
              }, 600);
            }),
          onRowDelete: oldData =>
            new Promise(resolve => {
              setTimeout(() => {
                resolve();
                setState(prevState => {
                  const data = [...prevState.data];
                  data.splice(data.indexOf(oldData), 1);
                  let tool=tools;
                  tool[lessonIndex].tools[4].items=data;
                  if(type==='lessonInto'){
                   // tool[lessonIndex][4].items=data;
                   handleSelectResourcesIntoLessons(parentIndex,data, lessonIndex, 4)
                  }else{
                    tool[4].items=data;
                    handleSelectResources(parentIndex, tool)
                  }
                  return { ...prevState, data };
                });
              }, 600);
            })
        }}
        localization={{
          pagination: {
            // labelDisplayedRows: '{from}-{to} of {count}'
          },
          toolbar: {
            // nRowsSelected: '{0} row(s) selected'
          },
          header: {
            actions: "" //removed title of action column
          },
          body: {
            emptyDataSourceMessage: "No presentations"
          }
        }}
      />
      <FeedbackHelp
        validation={{
          error: false,
          errorMsg: "",
          errorType: "",
          a11y: null
        }}
        tipMsg="instructions"
        describedBy={"i05-helper-text"}
      />
    </React.Fragment>
  );
}
