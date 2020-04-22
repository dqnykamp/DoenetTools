import React, { Component } from 'react';
import axios from 'axios';
axios.defaults.withCredentials = true;
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faFileAlt, faFolder, faArrowUp, 
  faArrowDown, faDotCircle, faEdit, faArrowRight, faFolderOpen, faLink} from '@fortawesome/free-solid-svg-icons';
import "./branchBrowser.css";
import SpinningLoader from './SpinningLoader';
import styled from 'styled-components';

function formatTimestamp(date) {  
  let delta = Math.round((new Date - new Date(date)) / 1000);

  let minute = 60;
  let hour = minute * 60;
  let day = hour * 24;
  let week = day * 7;
  let month = 30 * day;
  let year = 52 * week;

  let result = "";

  if (delta < minute) {
    result = 'Just now';
  } else if (delta < hour) {
    result = Math.floor(delta / minute) + ' minute(s) ago';
  } else if (delta < day) {
    result = Math.floor(delta / hour) + ' hour(s) ago';
  } else if (delta < day * 2) {
    result = 'Yesterday';
  } else if (delta < week) {
    result = Math.floor(delta / day) + ' day(s) ago';
  } else if (delta < month) {
    let weekNumber = Math.floor(delta / week);
    let dayNumber = Math.floor((delta - (weekNumber * week)) / day);
    if (dayNumber !== 0) result = `${weekNumber} week(s) and ${dayNumber} day(s) ago`;
    else result = `${weekNumber} week(s) ago`;
  } else if (delta < year) {
    let monthNumber = Math.floor(delta / month);
    let dayNumber = Math.floor((delta - (monthNumber * month)) / day);
    if (dayNumber !== 0) result = `${monthNumber} month(s) and ${dayNumber} day(s) ago`;
    else result = `${monthNumber} month(s) ago`;
  } else {  // years
    let yearNumber = Math.floor(delta / year);
    let monthNumber = Math.floor((delta - (yearNumber * year)) / month);
    if (monthNumber !== 0) result = `${yearNumber} year(s) and ${monthNumber} month(s) ago`;
    else result = `${yearNumber} year(s) ago`;
  }
  return result;
}

class DoenetBranchBrowser extends Component {
  static defaultProps = {
    addContentToFolder: null,
    addContentToRepo: null,
    removeContentFromFolder: null,
    selectedDrive: "Content",
    selectedCourse: null,
    directoryData: [],
    selectedItems: [],
    selectedItemsType: [],
  }
  constructor(props) {
    super(props);

    this.state = {
      directoryStack: props.directoryData,
      selectedItems: props.selectedItems,
      selectedItemsType: props.selectedItemsType,
      sortBy: "title",
      sortOrderAsc: "ASC"
    }

    // handle null props
    this.hideAddRemoveButtons = this.disableEditing = this.props.addContentToFolder === null
                     || this.props.removeContentFromFolder === null;

    this.handleAddContentToFolder = this.handleAddContentToFolder.bind(this);
    this.handleRemoveContentFromCurrentFolder = this.handleRemoveContentFromCurrentFolder.bind(this);
    this.handleRemoveContentFromCourse = this.handleRemoveContentFromCourse.bind(this);
    this.handleContentItemClick = this.handleContentItemClick.bind(this);
    this.handleContentItemDoubleClick = this.handleContentItemDoubleClick.bind(this);
    this.handleFolderDoubleClick = this.handleFolderDoubleClick.bind(this);
    this.handleUrlItemDoubleClick = this.handleUrlItemDoubleClick.bind(this);
    this.upOneDirectory = this.upOneDirectory.bind(this);
    this.openFolder = this.openFolder.bind(this);
    this.pushDirectoryStack = this.pushDirectoryStack.bind(this);
    this.popDirectoryStack = this.popDirectoryStack.bind(this);
    this.peekDirectoryStack = this.peekDirectoryStack.bind(this);
    this.getAllSelectedItems = this.getAllSelectedItems.bind(this);
    this.flattenFolder = this.flattenFolder.bind(this);
    this.jumpToDirectory = this.jumpToDirectory.bind(this);
    this.updateSortOrder = this.updateSortOrder.bind(this);
    this.sortContent = this.sortContent.bind(this);
    this.sortFolders = this.sortFolders.bind(this);
    this.sortUrls = this.sortUrls.bind(this);
    this.openEditUrlForm = this.openEditUrlForm.bind(this);
  }

  getAllSelectedItems() {
    let allSelectedContent = [];
    for (let i =0; i < this.state.selectedItemsType.length; i++) {
      if (this.state.selectedItemsType[i] === "folder") {
        // flatten folders to get all content
        allSelectedContent = allSelectedContent.concat(this.flattenFolder(this.state.selectedItems[i]));
      } else {
        allSelectedContent.push({
          branchId: this.state.selectedItems[i],
          contentIds: this.props.allContentInfo[this.state.selectedItems[i]].contentIds
        });
      }
    }

    return allSelectedContent;
  }

  flattenFolder(folderId) {
    let itemIds = [];
    let childFolder = this.props.allFolderInfo[folderId].childFolders;
    childFolder.forEach((childFolderId) => {
      itemIds = itemIds.concat(this.flattenFolder(childFolderId));
    })
    this.props.allFolderInfo[folderId].childContent.forEach((childContentBranchId) => {
      itemIds.push({
        branchId: childContentBranchId,
        contentIds: this.props.allContentInfo[childContentBranchId].contentIds
      });
    })
    return itemIds;
  }

  handleAddContentToFolder(folderId) {
    let selectedItemsWithoutRepo = [];
    let selectedItemsTypeWithoutRepo = [];
    
    this.state.selectedItems.forEach((itemId, index) => {
      if (this.state.selectedItemsType[index] == "content" || 
          this.state.selectedItemsType[index] == "url" ||
          (this.state.selectedItemsType[index] == "folder" && !this.props.allFolderInfo[itemId].isRepo)) {
        selectedItemsWithoutRepo.push(itemId);
        selectedItemsTypeWithoutRepo.push((this.state.selectedItemsType[index]));
      }
    });

    if (this.props.allFolderInfo[folderId].isRepo) {
      this.props.addContentToRepo(selectedItemsWithoutRepo, selectedItemsTypeWithoutRepo, folderId);
    } else {
      this.props.addContentToFolder(selectedItemsWithoutRepo, selectedItemsTypeWithoutRepo, folderId);
    }
    this.setState({selectedItems: [], selectedItemType: []});
  }

  handleRemoveContentFromCurrentFolder() {
    let folderId = this.peekDirectoryStack();
    this.props.removeContentFromFolder(this.state.selectedItems, this.state.selectedItemsType, folderId);
    this.setState({selectedItems: [], selectedItemType: []});
  }

  handleRemoveContentFromCourse() {
    this.props.removeContentFromCourse(this.state.selectedItems);
  }

  buildBreadcrumb() {
    let directoryList = [];
    // build directory list
    // always add current drive/course as first item
    directoryList.push(
      <div 
      onClick={() => this.jumpToDirectory("")} 
      key="breadcrumbDrive"
      data-cy="breadcrumbbase">
        <label>
          {this.props.selectedDrive === "Courses" ? 
            this.props.allCourseInfo[this.props.selectedCourse].courseCode 
            : this.props.selectedDrive}
        </label>
      </div>
    );

    // add items in directoryStack if any
    this.state.directoryStack.forEach((folderId) => {
      let folderTitle = this.props.allFolderInfo[folderId].title;

      directoryList.push(
        <div 
        onClick={() => this.jumpToDirectory(folderId)} 
        key={"breadcrumb"+folderId}
        data-cy={"breadcrumb"+folderId}>
          <label>{folderTitle}</label>
        </div>
      );
    });

    this.breadcrumb = <Breadcrumb separator='>'>
                        {directoryList}
                      </Breadcrumb>;
  }

  buildFolderItems() {
    this.folderItems = [];
    this.folderList = this.props.folderList;
    // show items in current directory
    if (this.state.directoryStack.length !== 0) {
      let folderId = this.peekDirectoryStack();
      this.folderList = this.props.allFolderInfo[folderId].childFolders;
    }
    this.sortFolders();
    
    this.tableIndex = 0;
    // create table row items to be rendered in chooser
    for (let folderId of this.folderList){
      let title = this.props.allFolderInfo[folderId].title;
      let publishDate = formatTimestamp(this.props.allFolderInfo[folderId].publishDate);
      let childContent = this.props.allFolderInfo[folderId].childContent;
      let childUrls = this.props.allFolderInfo[folderId].childUrls;
      let childFolder = this.props.allFolderInfo[folderId].childFolder;
      let isRepo = this.props.allFolderInfo[folderId].isRepo;
      let isPublic = this.props.allFolderInfo[folderId].isPublic;
      let isShared = this.props.allFolderInfo[this.props.allFolderInfo[folderId].rootId].isRepo;
      let classes = this.state.selectedItems.includes(folderId) ?
                      "browserDataRow browserSelectedRow": "browserDataRow";
      
      let showRemoveItemIcon = false;
      let showAddItemIcon = true;
      if (this.props.selectedDrive === "Content") {
        // disable remove content in base dir when in mycontent
        let notInBaseDirOfContent = this.state.directoryStack.length !== 0;
        showRemoveItemIcon = !this.hideAddRemoveButtons && 
                              notInBaseDirOfContent &&
                              this.state.selectedItems.length !== 0 &&
                              this.state.selectedItems.includes(folderId);

        showAddItemIcon = !this.hideAddRemoveButtons &&
                          this.state.selectedItems.length !== 0 &&
                          !this.state.selectedItems.includes(folderId) &&
                          !this.state.selectedItems.includes(this.state.directoryStack[this.state.directoryStack.length - 1]);

      } else if (this.props.selectedDrive === "Courses") {
        // disable remove content when not in base dir
        let inBaseDir = this.state.directoryStack.length === 0;
        showRemoveItemIcon = !this.hideAddRemoveButtons &&
                              inBaseDir &&
                              this.state.selectedItems.length !== 0 &&
                              this.state.selectedItems.includes(folderId);
        // restrict content editing in courses
        showAddItemIcon = false;
      }


      this.folderItems.push(
        <Folder      
          onClick={this.handleContentItemClick}
          onDoubleClick={this.openFolder}
          title={title}
          publishDate={publishDate}
          draftDate={" — "}
          childContent={childContent}
          childUrls={childUrls}
          childFolder={childFolder}
          folderId={folderId}
          isRepo={isRepo}
          isPublic={isPublic}
          isShared={isShared}
          classes={classes}
          key={"folder" + folderId}
          tableIndex={this.tableIndex++}
          handleAddContentToFolder={this.handleAddContentToFolder}
          showAddItemIcon={showAddItemIcon}
          showRemoveItemIcon={showRemoveItemIcon}
          handleRemoveContent={this.props.selectedDrive === "Content" ? 
                              this.handleRemoveContentFromCurrentFolder :
                              this.handleRemoveContentFromCourse}
          renameFolder={this.props.renameFolder}/>
      );
    }
  }
  
  buildContentItems(){
    this.contentItems = [];
    this.contentList = this.props.contentList;
    // show items in current directory
    if (this.state.directoryStack.length !== 0) {
      let folderId = this.peekDirectoryStack();
      this.contentList = this.props.allFolderInfo[folderId].childContent;
    }
    this.sortContent();

    // build files
    for (let branchId of this.contentList){
      let title = this.props.allContentInfo[branchId].title;
      let publishDate = formatTimestamp(this.props.allContentInfo[branchId].publishDate);
      let draftDate = formatTimestamp(this.props.allContentInfo[branchId].draftDate);
      let isShared = this.props.allContentInfo[branchId].rootId == "root" ? false :
        this.props.allFolderInfo[this.props.allContentInfo[branchId].rootId].isRepo;
      let isPublic = this.props.allContentInfo[branchId].isPublic;
      let classes = this.state.selectedItems.includes(branchId) ?
                      "browserDataRow browserSelectedRow": "browserDataRow";
      
      let showRemoveItemIcon = false;
      if (this.props.selectedDrive === "Content") {
        // disable remove content in base dir when in mycontent
        let notInBaseDirOfContent = this.state.directoryStack.length !== 0;
        showRemoveItemIcon = !this.hideAddRemoveButtons && 
                              notInBaseDirOfContent &&
                              this.state.selectedItems.length !== 0 &&
                              this.state.selectedItems.includes(branchId);

      } else if (this.props.selectedDrive === "Courses") {
        // disable remove content when not in base dir
        let inBaseDir = this.state.directoryStack.length === 0;
        showRemoveItemIcon = !this.hideAddRemoveButtons &&
                              inBaseDir &&
                              this.state.selectedItems.length !== 0 &&
                              this.state.selectedItems.includes(branchId);
      }

      // create table row items to be rendered in chooser
      this.contentItems.push(
        <File
        branchId={branchId}
        classes={classes}
        onClick={this.handleContentItemClick}
        onDoubleClick={this.handleContentItemDoubleClick}
        title={title}
        publishDate={publishDate}
        draftDate={draftDate}
        isShared={isShared}
        isPublic={isPublic}
        key={"contentItem" + branchId}
        tableIndex={this.tableIndex++}
        showRemoveItemIcon={showRemoveItemIcon}
        handleRemoveContent={this.props.selectedDrive === "Content" ? 
                            this.handleRemoveContentFromCurrentFolder :
                            this.handleRemoveContentFromCourse}/>);
        
    }
  }

  buildUrlItems(){
    this.urlItems = [];
    this.urlList = this.props.urlList;
    // show items in current directory
    if (this.state.directoryStack.length !== 0) {
      let folderId = this.peekDirectoryStack();
      this.urlList = this.props.allFolderInfo[folderId].childUrls;
    }
    this.sortUrls();

    // build urls
    for (let urlId of this.urlList){
      let title = this.props.allUrlInfo[urlId].title;
      let url = this.props.allUrlInfo[urlId].url;
      let description = this.props.allUrlInfo[urlId].description;
      let publishDate = formatTimestamp(this.props.allUrlInfo[urlId].publishDate);
      let isShared = this.props.allUrlInfo[urlId].rootId == "root" ? false :
        this.props.allFolderInfo[this.props.allUrlInfo[urlId].rootId].isRepo;
      let isPublic = this.props.allUrlInfo[urlId].isPublic;
      let classes = this.state.selectedItems.includes(urlId) ?
                      "browserDataRow browserSelectedRow": "browserDataRow";
      
      let showRemoveItemIcon = false;
      if (this.props.selectedDrive === "Content") {
        // disable remove content in base dir when in mycontent
        let notInBaseDirOfContent = this.state.directoryStack.length !== 0;
        showRemoveItemIcon = !this.hideAddRemoveButtons && 
                              notInBaseDirOfContent &&
                              this.state.selectedItems.length !== 0 &&
                              this.state.selectedItems.includes(urlId);

      } else if (this.props.selectedDrive === "Courses") {
        // disable remove content when not in base dir
        let inBaseDir = this.state.directoryStack.length === 0;
        showRemoveItemIcon = !this.hideAddRemoveButtons &&
                              inBaseDir &&
                              this.state.selectedItems.length !== 0 &&
                              this.state.selectedItems.includes(urlId);
      }

      // create table row items to be rendered in chooser
      this.urlItems.push(
        <Url
        urlId={urlId}
        classes={classes}
        onClick={this.handleContentItemClick}
        onDoubleClick={this.handleUrlItemDoubleClick}
        title={title}
        url={url}
        publishDate={publishDate}
        description={description}
        isShared={isShared}
        isPublic={isPublic}
        key={"urlItem" + urlId}
        tableIndex={this.tableIndex++}
        showRemoveItemIcon={showRemoveItemIcon}
        handleRemoveContent={this.props.selectedDrive === "Content" ? 
                            this.handleRemoveContentFromCurrentFolder :
                            this.handleRemoveContentFromCourse}/>);
        
    }
  }

  handleContentItemClick (itemId, type, tableIndex) {
    // show content/folder info on infoPanel
    // check for keystroke
    if (window.event.ctrlKey || window.event.metaKey) {
      let currentSelectedItems = this.state.selectedItems;
      let currentSelectedItemsType = this.state.selectedItemsType;
      let index = currentSelectedItems.indexOf(itemId);
      if (index > -1) {
        currentSelectedItems.splice(index, 1);
        currentSelectedItemsType.splice(index, 1);
      } else {
        currentSelectedItems.push(itemId);
        currentSelectedItemsType.push(type);
      }

      this.setState({
        selectedItems: currentSelectedItems,
        selectedItemsType: currentSelectedItemsType
      });
      
      if (this.props.updateSelectedItems !== null) {
        this.props.updateSelectedItems(currentSelectedItems, currentSelectedItemsType);
      }
    } else if (window.event.shiftKey) {
      let currentSelectedItems = this.state.selectedItems;
      let currentSelectedItemsType = this.state.selectedItemsType;
      
      let allTableItems = this.folderList.concat(this.contentList, this.urlList);

      // if no previous items selected
      if (currentSelectedItems.length === 0) {
        // select current item
        this.setState({
          selectedItems: [itemId],
          selectedItemsType: [type]
        });

        if (this.props.updateSelectedItems !== null) {
          this.props.updateSelectedItems([itemId], [type]);
        }
        return;
      }
      
      // get lastSelectedItemIndex, currentSelectedItemIndex
      let lastSelectedItemIndex = allTableItems.indexOf(currentSelectedItems[currentSelectedItems.length - 1]);
      let currentSelectedItemIndex = tableIndex;

      // maintain last < current order
      if (currentSelectedItemIndex < lastSelectedItemIndex) {
        let temp = lastSelectedItemIndex;
        lastSelectedItemIndex = currentSelectedItemIndex;
        currentSelectedItemIndex = temp;
      }

      // select all items between last and current
      while (lastSelectedItemIndex <= currentSelectedItemIndex) {
        // get id and type of item to be selected
        let currentItemId = allTableItems[lastSelectedItemIndex];
        let currentItemType = "content";
        if (this.props.allContentInfo[currentItemId] === undefined) {
          currentItemType =  this.props.allFolderInfo[currentItemId] === undefined ? "url" : "folder";
        }

        // check if already inside, if true then continue
        if (!currentSelectedItems.includes(currentItemId)) {
          currentSelectedItems.push(currentItemId);
          currentSelectedItemsType.push(currentItemType);
        }
        lastSelectedItemIndex++;
      }
    
      this.setState({
        selectedItems: currentSelectedItems,
        selectedItemsType: currentSelectedItemsType
      });


      if (this.props.updateSelectedItems !== null) {
        this.props.updateSelectedItems(currentSelectedItems, currentSelectedItemsType);
      }
    } else {
      this.setState({
        selectedItems: [itemId],
        selectedItemsType: [type]
      });

      if (this.props.updateSelectedItems !== null) {
        this.props.updateSelectedItems([itemId], [type]);
      }
    }    
  }

  handleContentItemDoubleClick(branchId) {
    if (!this.disableEditing) {
      // redirect to editor
      window.location.href=`/editor?branchId=${branchId}`;
      this.props.updateSelectedItems([branchId], ["content"]);
    }
  }

  handleFolderDoubleClick(folderId) {
    this.setState({
      currentDirectory: folderId
    });
  }

  handleUrlItemDoubleClick(urlId) {
      window.location.href = this.props.allUrlInfo[urlId].url;
  }

  pushDirectoryStack(folderId) {
    let directoryStack = this.state.directoryStack;
    directoryStack.push(folderId);
    this.setState({
      directoryStack: directoryStack
    }); 
  }

  popDirectoryStack() {
    let directoryStack = this.state.directoryStack;
    directoryStack.pop();
    this.setState({
      directoryStack: directoryStack
    });
  }

  peekDirectoryStack() {
    return this.state.directoryStack[this.state.directoryStack.length - 1];
  }

  openFolder(folderId) {
    this.pushDirectoryStack(folderId);
    this.setState({selectedItems: [], selectedItemType: []});
    if (this.props.updateDirectoryStack !== null) {
      this.props.updateDirectoryStack(this.state.directoryStack);
    }
  }

  upOneDirectory() {
    this.popDirectoryStack();
    this.setState({selectedItems: [], selectedItemType: []});
    if (this.props.updateDirectoryStack !== null) {
      this.props.updateDirectoryStack(this.state.directoryStack);
    }
  }

  jumpToDirectory(folderId) {
    // pop all items after folderId
    this.setState({selectedItems: [], selectedItemType: []});
    while (this.state.directoryStack.length > 0 && this.peekDirectoryStack() !== folderId) {
      this.upOneDirectory();      
    }
  }

  openEditUrlForm() {
    this.props.updateSelectedItems([this.state.selectedItems[this.state.selectedItems.length - 1]],
      [this.state.selectedItemsType[this.state.selectedItemsType.length - 1]]);
    this.props.openEditUrlForm();
  }

  updateSortOrder(colName) {
    if (colName !== this.state.sortBy) {
      this.setState({sortBy: colName, sortOrderAsc: true});
    } else {
      this.setState({sortOrderAsc: !this.state.sortOrderAsc});
    }
  }

  sortContent() {
    if (this.state.sortOrderAsc) {
      if (this.state.sortBy === "publishedDate") {
        this.contentList.sort(
          (a,b) => { 
            return new Date(this.props.allContentInfo[a].publishDate) - new Date(this.props.allContentInfo[b].publishDate)}
        );
      } else if (this.state.sortBy === "draftDate") {
        this.contentList.sort(
          (a,b) => { 
            return new Date(this.props.allContentInfo[a].draftDate) - new Date(this.props.allContentInfo[b].draftDate)}
        );
      } else if (this.state.sortBy === "title") {
        this.contentList.sort(
          (a,b) => { 
            return (this.props.allContentInfo[a].title.localeCompare(this.props.allContentInfo[b].title))}
        );
      }
    } else {
      if (this.state.sortBy === "publishedDate") {
        this.contentList.sort(
          (b,a) => { 
            return new Date(this.props.allContentInfo[a].publishDate) - new Date(this.props.allContentInfo[b].publishDate)}
        );
      } else if (this.state.sortBy === "draftDate") {
        this.contentList.sort(
          (b,a) => { 
            return new Date(this.props.allContentInfo[a].draftDate) - new Date(this.props.allContentInfo[b].draftDate)}
        );
      } else if (this.state.sortBy === "title") {
        this.contentList.sort(
          (b,a) => { 
            return (this.props.allContentInfo[a].title.localeCompare(this.props.allContentInfo[b].title))}
        );
      }
    }
  }

  sortUrls() {
    if (this.state.sortOrderAsc) {
      if (this.state.sortBy === "publishedDate") {
        this.urlList.sort(
          (a,b) => { 
            return new Date(this.props.allUrlInfo[a].publishDate) - new Date(this.props.allUrlInfo[b].publishDate)}
        );
      } else if (this.state.sortBy === "draftDate") {
        this.urlList.sort(
          (a,b) => { 
            return new Date(this.props.allUrlInfo[a].draftDate) - new Date(this.props.allUrlInfo[b].draftDate)}
        );
      } else if (this.state.sortBy === "title") {
        this.urlList.sort(
          (a,b) => { 
            return (this.props.allUrlInfo[a].title.localeCompare(this.props.allUrlInfo[b].title))}
        );
      }
    } else {
      if (this.state.sortBy === "publishedDate") {
        this.urlList.sort(
          (b,a) => { 
            return new Date(this.props.allUrlInfo[a].publishDate) - new Date(this.props.allUrlInfo[b].publishDate)}
        );
      } else if (this.state.sortBy === "draftDate") {
        this.urlList.sort(
          (b,a) => { 
            return new Date(this.props.allUrlInfo[a].draftDate) - new Date(this.props.allUrlInfo[b].draftDate)}
        );
      } else if (this.state.sortBy === "title") {
        this.urlList.sort(
          (b,a) => { 
            return (this.props.allUrlInfo[a].title.localeCompare(this.props.allUrlInfo[b].title))}
        );
      }
    }
  }

  sortFolders() {
    if (this.state.sortOrderAsc) {
      if (this.state.sortBy === "publishedDate") {
        this.folderList.sort(
          (a,b) => { 
            if (this.props.allFolderInfo[a].isRepo && !this.props.allFolderInfo[b].isRepo) return -1;
            if (!this.props.allFolderInfo[a].isRepo && this.props.allFolderInfo[b].isRepo) return 1;
            return (new Date(this.props.allFolderInfo[a].publishDate) - new Date(this.props.allFolderInfo[b].publishDate))
          });
      } else if (this.state.sortBy === "title") {
        this.folderList.sort(
          (a,b) => { 
            if (this.props.allFolderInfo[a].isRepo && !this.props.allFolderInfo[b].isRepo) return -1;
            if (!this.props.allFolderInfo[a].isRepo && this.props.allFolderInfo[b].isRepo) return 1;
            return (this.props.allFolderInfo[a].title.localeCompare(this.props.allFolderInfo[b].title));}
        );
      }
    }else {
      if (this.state.sortBy === "publishedDate") {
        this.folderList.sort(
          (b,a) => { 
            if (this.props.allFolderInfo[a].isRepo && !this.props.allFolderInfo[b].isRepo) return 1;
            if (!this.props.allFolderInfo[a].isRepo && this.props.allFolderInfo[b].isRepo) return -1;
            return new Date(this.props.allFolderInfo[a].publishDate) - new Date(this.props.allFolderInfo[b].publishDate)}
        );
      } else if (this.state.sortBy === "title") {
        this.folderList.sort(
          (b,a) => { 
            if (this.props.allFolderInfo[a].isRepo && !this.props.allFolderInfo[b].isRepo) return 1;
            if (!this.props.allFolderInfo[a].isRepo && this.props.allFolderInfo[b].isRepo) return -1;
            return (this.props.allFolderInfo[a].title.localeCompare(this.props.allFolderInfo[b].title));}
        );
      }
    }
  }

  render() {

    if (this.props.loading){
      return <div id="branchBrowser" style={{display:"flex",justifyContent:"center",alignItems:"center"}}>
              <SpinningLoader/>
             </div>
    }

    this.buildBreadcrumb();
    this.buildFolderItems();
    this.buildContentItems();
    this.buildUrlItems();

    return(
      <React.Fragment>
        <div id="branchBrowser">
          <div id="contentList">
            {this.breadcrumb}
              <table id="browser">
                <tbody>
                  <tr className="browserHeadingsRow" key="browserHeadingsRow">
                    <th 
                    className={this.state.sortBy === "title" ? "browserItemName browserSelectedHeading" : "browserItemName"}
                    onClick={() => this.updateSortOrder("title")}>
                      Name   {this.state.sortBy === "title" ? this.state.sortOrderAsc ? 
                                                            <FontAwesomeIcon icon={faArrowUp} className="sortOrderIcon"/> :
                                                            <FontAwesomeIcon icon={faArrowDown} className="sortOrderIcon"/> : ""}
                    </th>
                    <th 
                    className={this.state.sortBy === "draftDate" ? "draftDate browserSelectedHeading" : "draftDate"}
                    onClick={() => this.updateSortOrder("draftDate")}>
                      Draft Date   {this.state.sortBy === "draftDate" ? this.state.sortOrderAsc ? 
                                                            <FontAwesomeIcon icon={faArrowUp} className="sortOrderIcon"/> :
                                                            <FontAwesomeIcon icon={faArrowDown} className="sortOrderIcon"/> : ""}
                    </th>
                    <th 
                    className={this.state.sortBy === "publishedDate" ? "publishDate browserSelectedHeading" : "publishDate"}
                    onClick={() => this.updateSortOrder("publishedDate")}>
                      Published Date  {this.state.sortBy === "publishedDate" ? this.state.sortOrderAsc ? 
                                                            <FontAwesomeIcon icon={faArrowUp} className="sortOrderIcon"/> :
                                                            <FontAwesomeIcon icon={faArrowDown} className="sortOrderIcon"/> : ""}
                    </th>
                  </tr>
                  {this.state.directoryStack.length !== 0 &&
                  <tr
                  className="browserDataRow"
                  data-cy="upOneDirectory"
                  onDoubleClick={this.upOneDirectory}>
                    <td className="browserItemName">
                      <FontAwesomeIcon icon={faFolder} style={{"fontSize":"18px", "color":"#737373", "margin": "0px 15px"}}/>
                      <span>{"..."}</span>
                    </td>
                    <td className="draftDate"></td>
                    <td className="publishDate"></td>
                  </tr>}
                  {this.folderList.length == 0 && this.contentList.length == 0 && this.urlList.length == 0 &&
                    <div id="browserEmptyMessage"><span>Create new files or folders using the New button</span></div>}
                  {this.folderItems}
                  {this.contentItems}
                  {this.urlItems}
                </tbody>
              </table>
          </div>
          <InfoPanel
            selectedItems={this.state.selectedItems}
            selectedItemsType={this.state.selectedItemsType}
            selectedDrive={this.props.selectedDrive}
            selectedCourse={this.props.selectedCourse}
            allFolderInfo={this.props.allFolderInfo}
            allContentInfo={this.props.allContentInfo}
            allUrlInfo={this.props.allUrlInfo}
            allCourseInfo={this.props.allCourseInfo}
            disableEditing={this.disableEditing}
            openEditCourseForm={this.props.openEditCourseForm}
            publicizeRepo={this.props.publicizeRepo}
            openEditUrlForm={this.openEditUrlForm}
          />
        </div>
      </React.Fragment>
    );
  }
}

class File extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return(
      <tr
      className={this.props.classes}
      onClick={() => this.props.onClick(this.props.branchId, "content", this.props.tableIndex)}
      onDoubleClick={() => this.props.onDoubleClick(this.props.branchId)}
      data-cy={this.props.branchId}>
        <td className="browserItemName">
          {this.props.isShared && this.props.isPublic ? 
            <FontAwesomeIcon icon={faFileAlt} style={{"fontSize":"18px", "color":"#3aac90", "margin": "0px 15px"}}/> :
            <FontAwesomeIcon icon={faFileAlt} style={{"fontSize":"18px", "color":"#3D6EC9", "margin": "0px 15px"}}/>}
          <span>{this.props.title}</span>
        </td>
        <td className="draftDate">
          <span>{this.props.draftDate}</span>
        </td>
        <td className="publishDate">
          <div style={{"position":"relative"}}>
            {this.props.showRemoveItemIcon && 
            <div className="removeContentButtonWrapper">
              <FontAwesomeIcon icon={faArrowRight} className="removeContentButton" 
              onClick={() => this.props.handleRemoveContent(this.props.branchId)}/>
              <div className="removeContentButtonInfo"><span>Move out folder</span></div>
            </div>}
            <span>{this.props.publishDate}</span>
          </div>          
        </td>
      </tr>
    );
  }
}

class Url extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {

    return(
      <tr
      className={this.props.classes}
      onClick={() => this.props.onClick(this.props.urlId, "url", this.props.tableIndex)}
      onDoubleClick={() => this.props.onDoubleClick(this.props.urlId)}
      data-cy={this.props.urlId}>
        <td className="browserItemName">
          {this.props.isShared && this.props.isPublic ? 
            <FontAwesomeIcon icon={faLink} style={{"fontSize":"18px", "color":"#3aac90", "margin": "0px 15px"}}/> :
            <FontAwesomeIcon icon={faLink} style={{"fontSize":"18px", "color":"#3D6EC9", "margin": "0px 15px"}}/>}
          <span>{this.props.title}</span>
        </td>
        <td className="draftDate">
          <span>-</span>
        </td>
        <td className="publishDate">
          <div style={{"position":"relative"}}>
            {this.props.showRemoveItemIcon && 
            <div className="removeContentButtonWrapper">
              <FontAwesomeIcon icon={faArrowRight} className="removeContentButton" 
              onClick={() => this.props.handleRemoveContent(this.props.urlId)}/>
              <div className="removeContentButtonInfo"><span>Move out folder</span></div>
            </div>}
            <span>{this.props.publishDate}</span>
          </div>          
        </td>
      </tr>
    );
  }
}

class Folder extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      title: this.props.title
    }
    this.previousTitle = this.props.title;

    this.handleTitleChange = this.handleTitleChange.bind(this);
    this.handleKeyPress = this.handleKeyPress.bind(this);
  }

  handleTitleChange(e) {
    if (e.target.textContent == "") return;
    
    if (e.target.textContent !== this.state.title) {
      this.props.renameFolder(this.props.folderId, e.target.textContent);
      this.setState({
        title: e.target.textContent
      });
    }
  }

  handleKeyPress(e) {
    if (e.keyCode == 13) {  
      event.preventDefault(); 
      event.stopPropagation();
      e.target.blur();  // calls handleTitleChange automatically
    } 
  }

  render() {
    let folderIcon = <FontAwesomeIcon icon={faFolder} style={{"fontSize":"18px", "color":"#737373", "margin": "0px 15px"}}/>;
    if (this.props.isRepo) {
      folderIcon = this.props.isPublic ?
          <FontAwesomeIcon icon={faFolderOpen} style={{"fontSize":"18px", "color":"#3aac90", "margin": "0px 15px"}}/> :
          <FontAwesomeIcon icon={faFolder} style={{"fontSize":"18px", "color":"#3aac90", "margin": "0px 15px"}}/>;
    } else if (this.props.isShared && this.props.isPublic) {
      folderIcon = <FontAwesomeIcon icon={faFolderOpen} style={{"fontSize":"18px", "color":"#737373", "margin": "0px 15px"}}/>;
    }

    return(
      <tr
      className={this.props.classes}
      onClick={() => this.props.onClick(this.props.folderId, "folder", this.props.tableIndex)}
      onDoubleClick={() => this.props.onDoubleClick(this.props.folderId)}
      data-cy={this.props.folderId}>
        <td className="browserItemName">
          <div style={{"position":"relative"}}>
            {this.props.showAddItemIcon && 
            <div className="addContentButtonWrapper">
              <FontAwesomeIcon icon={faArrowRight} className="addContentButton" 
              onClick={() => this.props.handleAddContentToFolder(this.props.folderId)}/>
              <div className="addContentButtonInfo"><span>Move to Folder</span></div>
            </div>}
            {folderIcon}
            <span
            contentEditable="true"
            onKeyDown={(e) => {this.handleKeyPress(e)}}
            onBlur={(e) => this.handleTitleChange(e)}
            suppressContentEditableWarning={true}
            >{this.state.title}</span>
          </div>          
        </td>
        <td className="draftDate">
          <span>{this.props.draftDate}</span>
        </td>
        <td className="publishDate">
          <div style={{"position":"relative"}}>
            {this.props.showRemoveItemIcon && 
            <div className="removeContentButtonWrapper">
              <FontAwesomeIcon icon={faArrowRight} className="removeContentButton" 
              onClick={() => this.props.handleRemoveContent(this.props.folderId)}/>
              <div className="removeContentButtonInfo"><span>Move out folder</span></div>
            </div>}
            <span>{this.props.publishDate}</span>
          </div>          
        </td>
      </tr>
    );
  }
}

class InfoPanel extends Component {
  constructor(props) {
    super(props);
    this.addUsername = {};

    this.buildInfoPanelItemDetails = this.buildInfoPanelItemDetails.bind(this);
  }

  buildInfoPanel() {
    let selectedItemId = null;
    let selectedItemType = null;
    let itemTitle = "";
    let itemIcon = <FontAwesomeIcon icon={faDotCircle} style={{"fontSize":"18px", "color":"#737373"}}/>;

    if (this.props.selectedItems.length === 0) {
      // handle when no file selected, show folder/drive info
      selectedItemType = "Drive";
      if (this.props.selectedDrive === "Courses") {
        itemTitle = this.props.allCourseInfo[this.props.selectedCourse].courseName;
      } else {
        itemTitle = "Content";
      }

      this.buildInfoPanelDriveDetails();
    } else {
      // if file selected, show selectedFile/Folder info
      selectedItemId = this.props.selectedItems[this.props.selectedItems.length - 1];
      selectedItemType = this.props.selectedItemsType[this.props.selectedItemsType.length - 1];

      // get title
      if (selectedItemType === "folder") {
        itemTitle = this.props.allFolderInfo[selectedItemId].title;
        itemIcon = this.props.allFolderInfo[selectedItemId].isRepo ?
          <FontAwesomeIcon icon={faFolder} style={{"fontSize":"18px", "color":"#3aac90"}}/> :
          <FontAwesomeIcon icon={faFolder} style={{"fontSize":"18px", "color":"#737373"}}/>;
      } else if (selectedItemType === "url") {
        itemTitle = this.props.allUrlInfo[selectedItemId].title;
      } else {
        itemTitle = this.props.allContentInfo[selectedItemId].title;
        itemIcon = <FontAwesomeIcon icon={faFileAlt} style={{"fontSize":"18px", "color":"#3D6EC9"}}/>;
      }

      this.buildInfoPanelItemDetails(selectedItemId, selectedItemType);  
    }
    
    this.infoPanel = <React.Fragment>
      <div className="infoPanel">
        <div className="infoPanelTitle">
          <div className="infoPanelItemIcon">{itemIcon}</div>
          <span>{ itemTitle }</span>
        </div>
        <div className="infoPanelPreview">
          <span>Preview</span>
          <FontAwesomeIcon icon={faFileAlt} style={{"fontSize":"100px", "color":"#bfbfbf"}}/>
        </div>
        <div className="infoPanelDetails">
          {this.infoPanelDetails}
        </div>
      </div>
    </React.Fragment>
  }

  buildInfoPanelDriveDetails() {
    
    let itemDetails = {};
    this.infoPanelDetails = [];
    // handle when no file selected, show folder/drive info
    if (this.props.selectedDrive === "Courses") {
      let courseId = this.props.selectedCourse;
      let courseCode = this.props.allCourseInfo[courseId].courseCode;
      let term = this.props.allCourseInfo[courseId].term;
      let description = this.props.allCourseInfo[courseId].description;
      let department = this.props.allCourseInfo[courseId].department;
      let section = this.props.allCourseInfo[courseId].section;
      
      itemDetails = {
        "Owner" : "Me",
        "Course Code" : courseCode,
        "Term": term,
        "Department": department,
        "Section": section,
        "Description": description, 
      }; 
    } else {
      itemDetails = {
        "Owner" : "Me",
        "Modified" : "Today",
        "Published" : "Today",
      };
    }

    Object.keys(itemDetails).map(itemDetailsKey => {
      let itemDetailsValue = itemDetails[itemDetailsKey];
      this.infoPanelDetails.push(
      <tr key={"contentDetailsItem" + itemDetailsKey}>
        <td className="itemDetailsKey">{ itemDetailsKey }</td>
        <td className="itemDetailsValue">{ itemDetailsValue }</td>
      </tr>);
    })

    this.infoPanelDetails = <React.Fragment>
      <table id="infoPanelDetailsTable">
        <tbody>
          {this.infoPanelDetails}
        </tbody>
      </table>
      {this.props.selectedDrive === "Courses" &&
      <div id="editContentButtonContainer">
        <div id="editContentButton" data-cy="editContentButton"
        onClick={this.props.openEditCourseForm}>
          <FontAwesomeIcon icon={faEdit} style={{"fontSize":"20px", "color":"#43aa90"}}/>
          <span>Edit</span>
        </div>
      </div> 
      }
    </React.Fragment>
  }

  buildInfoPanelItemDetails(selectedItemId, selectedItemType) {
    
    this.infoPanelDetails = [];
    let itemDetails = {};
    if (selectedItemType === "folder") {

      itemDetails = {
        "Location"  : "Content",
        "Published" : formatTimestamp(this.props.allFolderInfo[selectedItemId].publishDate),
      };

      let isShared = this.props.allFolderInfo[this.props.allFolderInfo[selectedItemId].rootId].isRepo;
      if (this.props.allFolderInfo[selectedItemId].isRepo || isShared) {
        itemDetails = Object.assign(itemDetails, {"Public": this.props.allFolderInfo[selectedItemId].isPublic ? "Yes" : "No"});
      }
      // show change to public button if private repo
      if (this.props.allFolderInfo[selectedItemId].isRepo && !this.props.allFolderInfo[selectedItemId].isPublic) {
        itemDetails["Public"] = <React.Fragment>
            <span>No</span><button id="publicizeRepoButton" onClick={() => this.props.publicizeRepo(selectedItemId)}>Make Public</button>
        </React.Fragment>
      }
      //Display controls for who it's shared with
      let sharedJSX = null;
      if (this.props.allFolderInfo[selectedItemId].isRepo){
        const SharedUsersContainer = styled.div`
        display: flex;
        flex-direction: column;
        `;
        const UserPanel = styled.div`
        width: 320px;
        padding: 10px;
        border-bottom: 1px solid grey; 
        `;
     

        let users = [];
        for (let userInfo of this.props.allFolderInfo[selectedItemId].user_access_info){
          let removeAccess = <span>Owner</span>;
          if (userInfo.owner === "0"){
            removeAccess = <button onClick={()=>{
              const loadCoursesUrl='/api/removeRepoUser.php';
              const data={
                repoId: selectedItemId,
                username: userInfo.username,
              }
              const payload = {
                params: data
              }
      
              axios.get(loadCoursesUrl,payload)
              .then(resp=>{
                if (resp.data.success === "1"){
                  this.props.allFolderInfo[selectedItemId].user_access_info = resp.data.users;
                }
                this.forceUpdate();
              });
            
            }}>X</button>
          }
          users.push(<UserPanel key={`userpanel${userInfo.username}`}>
            {userInfo.firstName} {userInfo.lastName} - {userInfo.email} - {removeAccess}
            </UserPanel>)
        }

        const AddWrapper = styled.div`
        margin-top: 10px;
        `;

        sharedJSX = <>
        <p className="itemDetailsKey">Sharing Settings</p>
        <SharedUsersContainer>{users}</SharedUsersContainer>
        <AddWrapper>Add Username 
          <input type="text" value={this.addUsername[selectedItemId]} onChange={(e)=>{
            e.preventDefault();
            
            this.addUsername[selectedItemId] = e.target.value;
            // console.log(e.target.value);
            // console.log(this.addUsername);

          }}></input>
        <button onClick={()=>{
          const loadCoursesUrl='/api/addRepoUser.php';
        const data={
          repoId: selectedItemId,
          username: this.addUsername[selectedItemId],
        }
        const payload = {
          params: data
        }

        axios.get(loadCoursesUrl,payload)
        .then(resp=>{
          if (resp.data.success === "1"){
            this.props.allFolderInfo[selectedItemId].user_access_info = resp.data.users;
          }
          this.addUsername = {};
          this.forceUpdate();
        });
          
        }}>Add</button>
        </AddWrapper>
        </>
      }
 
      Object.keys(itemDetails).map(itemDetailsKey => {
        let itemDetailsValue = itemDetails[itemDetailsKey];
        // add only if content not empty
        this.infoPanelDetails.push(
        <tr key={"contentDetailsItem" + itemDetailsKey}>
          <td className="itemDetailsKey">{ itemDetailsKey }</td>
          <td className="itemDetailsValue">{ itemDetailsValue }</td>
        </tr>);
      })


      this.infoPanelDetails = <React.Fragment>
        <table id="infoPanelDetailsTable">
          <tbody>
            {this.infoPanelDetails}
          </tbody>
        </table>
        {sharedJSX}
      </React.Fragment>

    } else if (selectedItemType === "content") {
      // populate table with selected item info / drive info  
      let itemRelatedContent = [];
      // build related content
      let relatedContent = [];
      // flatten out and format related content
      itemRelatedContent.forEach(relatedItemBranchID => {
        let relatedItemTitle = this.props.allContentInfo[relatedItemBranchID].title;
        relatedContent.push(
          <div style={{"display":"block"}} key={"relatedItem" + relatedItemBranchID}>
            <FontAwesomeIcon icon={faFileAlt} style={{"fontSize":"14px", "color":"#3D6EC9", "marginRight": "10px"}}/>
            <a href={`/editor?branchId=${relatedItemBranchID}`}>{ relatedItemTitle }</a>
          </div>                      
        ); 
      });

      // build content versions
      let versions = [];
      let versionNumber = 1;
      // get and format versions
      this.props.allContentInfo[selectedItemId].contentIds.reverse().forEach(contentIdObj => {
        if (contentIdObj.draft !== "1") {
          let versionTitle = "Version " + versionNumber++;
          versions.push(
            <div style={{"display":"block"}} key={"version" + versionNumber}>
              <FontAwesomeIcon icon={faFileAlt} style={{"fontSize":"14px", "color":"#3D6EC9", "marginRight": "10px"}}/>
              <a href={`/editor?branchId=${selectedItemId}&contentId=${contentIdObj.contentId}`}>{ versionTitle }</a>
            </div>
          ); 
        } 
      });

      itemDetails = {
        "Location" : "Content",
        "Published" : formatTimestamp(this.props.allContentInfo[selectedItemId].publishDate),
        "Versions" : versions,
        // "Related content" : relatedContent,
      };

      let isShared = this.props.allContentInfo[selectedItemId].rootId == "root" ? false :
        this.props.allFolderInfo[this.props.allContentInfo[selectedItemId].rootId].isRepo;

      if (isShared) {
        itemDetails = Object.assign(itemDetails, {"Public": this.props.allContentInfo[selectedItemId].isPublic ? "Yes" : "No"});
      }

      Object.keys(itemDetails).map(itemDetailsKey => {
        let itemDetailsValue = itemDetails[itemDetailsKey];
        this.infoPanelDetails.push(
        <tr key={"contentDetailsItem" + itemDetailsKey}>
          <td className="itemDetailsKey">{ itemDetailsKey }</td>
          <td className="itemDetailsValue">{ itemDetailsValue }</td>
        </tr>);
      })

      this.infoPanelDetails = <React.Fragment>
        <table id="infoPanelDetailsTable">
          <tbody>
            {this.infoPanelDetails}
          </tbody>
        </table>
        {!this.props.disableEditing &&
        <div id="editContentButtonContainer">
          <div id="editContentButton" data-cy="editContentButton"
          onClick={()=> {window.location.href=`/editor?branchId=${selectedItemId}`}}>
            <FontAwesomeIcon icon={faEdit} style={{"fontSize":"20px", "color":"#43aa90"}}/>
            <span>Edit Draft</span>
          </div>
        </div> 
        }
      </React.Fragment>
    } else {
      itemDetails = {
        "Location" : "Content",
        "Published" : formatTimestamp(this.props.allUrlInfo[selectedItemId].publishDate),
        "Description" : this.props.allUrlInfo[selectedItemId].description,
        "Uses DoenetAPI" : this.props.allUrlInfo[selectedItemId].usesDoenetAPI == true ? "Yes" : "No",
      };

      let isShared = this.props.allUrlInfo[selectedItemId].rootId == "root" ? false :
        this.props.allFolderInfo[this.props.allUrlInfo[selectedItemId].rootId].isRepo;

      if (isShared) {
        itemDetails = Object.assign(itemDetails, {"Public": this.props.allUrlInfo[selectedItemId].isPublic ? "Yes" : "No"});
      }

      Object.keys(itemDetails).map(itemDetailsKey => {
        let itemDetailsValue = itemDetails[itemDetailsKey];
        this.infoPanelDetails.push(
        <tr key={"contentDetailsItem" + itemDetailsKey}>
          <td className="itemDetailsKey">{ itemDetailsKey }</td>
          <td className="itemDetailsValue">{ itemDetailsValue }</td>
        </tr>);
      })

      this.infoPanelDetails = <React.Fragment>
        <table id="infoPanelDetailsTable">
          <tbody>
            {this.infoPanelDetails}
            <tr key={"contentDetailsItemUrl"}>
              <td className="itemDetailsKey">URL</td>
              <td className="itemDetailsValue"><a href={this.props.allUrlInfo[selectedItemId].url}>{this.props.allUrlInfo[selectedItemId].url}</a></td>
            </tr>
          </tbody>
        </table>
        {!this.props.disableEditing &&
        <div id="editContentButtonContainer">
          <div id="editContentButton" data-cy="editContentButton"
          onClick={this.props.openEditUrlForm}>
            <FontAwesomeIcon icon={faEdit} style={{"fontSize":"20px", "color":"#43aa90"}}/>
            <span>Edit Link</span>
          </div>
        </div> 
        }
      </React.Fragment>
    }
  }

  render() {
    this.buildInfoPanel();
    return(<React.Fragment>
      {this.infoPanel}
    </React.Fragment>);
  };
}

const BreadcrumbItem = ({ children, ...props }) => (
  <li className='breadcrumbItem' {...props}>
    {children}
  </li>
)

const BreadcrumbSeparator = ({ children, ...props }) => (
  <li className='breadcrumbSeparator' {...props}>
    {children}
  </li>
)

const Breadcrumb = ({ separator = '/', ...props }) => {
  let children = React.Children.toArray(props.children)

  children = children.map((child, index) => (
    <BreadcrumbItem key={`breadcrumbItem${index}`}>{child}</BreadcrumbItem>
  ));

  const lastIndex = children.length - 1;

  children = children.reduce((acc, child, index) => {
    let notLast = index < lastIndex;
    if (notLast) {
      acc.push(
        child,
        <BreadcrumbSeparator key={`breadcrumbSep${index}`}>
          {separator}
        </BreadcrumbSeparator>,
      )
    } else {
      acc.push(child);
    }
    return acc;
  }, [])

  return (<ol className="breadcrumbList">{children}</ol>);
}

export default DoenetBranchBrowser;