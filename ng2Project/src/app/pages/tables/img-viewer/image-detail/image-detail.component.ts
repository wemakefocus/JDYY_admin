import 'rxjs/add/operator/toPromise';
import {Component, OnInit, ViewChild, AfterViewInit, ChangeDetectionStrategy, ChangeDetectorRef, ElementRef} from '@angular/core';
import { TreeNode, TREE_ACTIONS, KEYS, IActionMapping, ITreeOptions } from 'angular-tree-component';
import { Http } from '@angular/http';
import { Headers, RequestOptions } from '@angular/http';
import { PolymerChanges, OnPolymerChange } from '@codebakery/origami';

import * as _ from 'lodash'

import { ImageService } from './../img-viewer.service';

const localIp = '59.110.52.133';

@Component({
  selector: 'app-image-detail',
  templateUrl: './image-detail.component.html',
  styleUrls: ['./image-detail.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ImageDetailComponent implements OnInit, AfterViewInit, OnPolymerChange {
  @ViewChild('dicomDom') dicomDom: ElementRef;
  nodes: any[];
  element: object;
  savedState: string;
  isLabelDone: boolean;
  currentNode: TreeNode;
  localUrlPrefix: string;
  imgUrl: string;
  imgUrlPrefix: string;
  historyStates: object[];
  currentHistoryIndex: number;
  currentState: object;
  actionMapping: IActionMapping = {
    mouse: {
      // contextMenu: (tree, node, $event) => {
      //   $event.preventDefault();
      //   alert(`context menu for ${node.data.name}`);
      // },
      dblClick: (tree, node, $event) => {
        if (node.hasChildren) {TREE_ACTIONS.TOGGLE_EXPANDED(tree, node, $event);}
      },
      click: (tree, node, $event) => {
        $event.shiftKey
          ? TREE_ACTIONS.TOGGLE_SELECTED_MULTI(tree, node, $event)
          : TREE_ACTIONS.TOGGLE_SELECTED(tree, node, $event);
        if (node.data.children && node.data.children.length === 0) {
          // console.log(node);
          // console.log(tree);
          const leafNodesUrl = this.localUrlPrefix + '/data/imginfos/' +
            node.parent.data.name + '/' + node.data.scanId;
          this.http.get(leafNodesUrl).toPromise().then(res => {
            const data = res.json();
            const imgs = data.ResultSet.content.images;
            for (let j = 0; j < imgs.length; j++) {
              const imgNode = {
                name: imgs[j].img_name,
                labelState: imgs[j].img_label,
                url: imgs[j].img_uri,
                isLabelDone: true
              }
              if (imgs[j].img_label === 0) {
                imgNode.isLabelDone = false;
              }
              node.data.children.push(imgNode);
            }
            node.treeModel.update();
          });
        }
        if (!node.data.children) {
          $('.list-group-item').removeClass('active');
          this.clear();
          this.currentNode = node;
          this.imgUrl = this.imgUrlPrefix + node.data.url;
          this.loadImg();
        }
      }
    },
    keys: {
      [KEYS.ENTER]: (tree, node, $event) => alert(`This is ${node.data.name}`)
    }
  };
  customTemplateStringOptions: ITreeOptions = {
    displayField: 'subTitle',
    isExpandedField: 'expanded',
    idField: 'uuid',
    actionMapping: this.actionMapping,
    nodeHeight: 23,
    allowDrag: false,
    useVirtualScroll: true,
    // animateExpand: true,
    // animateSpeed: 30,
    // animateAcceleration: 1.2
  };
  images: object[];
  imageUrl;
  viewMode: string = 'singleView';
  @PolymerChanges() isDisabled: boolean;
  private isFourImageShown: boolean = false;
  private _opened: boolean = false;
  private _mode: string = 'push';
  private _position: string = 'right';
  private _toggleSidebar() {
    this._opened = !this._opened;
  }
  isMultiView: boolean= false;
  constructor(
    private http: Http,
    private imageService: ImageService,
    private changeRef: ChangeDetectorRef,
  ) {
    this.isLabelDone = true;
    this.localUrlPrefix = 'http://' + localIp + ':8081';
    this.imgUrlPrefix = 'wadouri:http://' + localIp + ':8081';
    this.historyStates = [];
    this.currentHistoryIndex = -1;
    this.imageUrl = [
      {
        id: 'test1',
        url: 'example://1'
      },
      {
        id: 'test2',
        url: 'example://2'
      },
      {
        id: 'test3',
        url: 'example://3'
      },
      {
        id: 'test4',
        url: 'example://1'
      },
      {
        id: 'test5',
        url: 'example://2'
      },
      {
        id: 'test6',
        url: 'example://3'
      },
      {
        id: 'test7',
        url: 'example://1'
      },
      {
        id: 'test8',
        url: 'example://2'
      },
      {
        id: 'test9',
        url: 'example://3'
      }
      // {
      //   id: 'test4',
      //   url: 'wadouri:https://raw.githubusercontent.com/chafey/cornerstoneWADOImageLoader/master/testImages/CT2_J2KR'
      // }
    ];
    // this.localUrlPrefix = 'http://localhost:8081';
    // this.imgUrlPrefix = 'wadouri:http://localhost:8081';
  }
  ngOnInit(): void {
    if (!cornerstoneWADOImageLoader.webWorkerManager.isInitialized) {
      const config = {
        webWorkerPath : '/cornerstoneWADOImageLoaderWebWorker.js',
        taskConfiguration: {
          'decodeTask' : {
            codecsPath: '/cornerstoneWADOImageLoaderCodecs.js'
          }
        }
      };
      cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
      cornerstoneWADOImageLoader.webWorkerManager.isInitialized = true;
    }
  }

  ngAfterViewInit() {
   /* // Retrieve the DOM element itself
    console.log($('#dicomDom'));
    console.log(this.dicomDom.nativeElement);
    this.element = this.dicomDom.nativeElement;
    const element = this.element;
    this.imgUrl = 'example://1';
    // this.imgUrl = 'wadouri:http://localhost:8081/data/labelinfos/XNAT_E00002/1/51d7aac4bcb27b67bddbab6f13969b61.dcm';
    // this.imgUrl = 'wadouri:https://raw.githubusercontent.com/chafey/cornerstoneWADOImageLoader/master/testImages/CT2_J2KR';
    // Enable the element with Cornerstone
    cornerstone.enable(element);
    // let testEls = $('.cornerstone-test');
    // console.log(testEls);

    // Listen for changes to the viewport so we can update the text overlays in the corner

    // $('#dicomDom').on('endFreehandDrawing', (e) => {
    //   console.log("endFreehandDrawing");
    //   this.recordHistory();
    // });
    // $('#dicomDom').on('CornerstoneImageRendered', (e) => {
    //   console.log('dicomimage CornerstoneImageRendered');
    //   const viewport = cornerstone.getViewport(e.target);
    //   $('#mrbottomleft').text('WW/WC: ' + Math.round(viewport.voi.windowWidth) + '/' + Math.round(viewport.voi.windowCenter));
    //   $('#mrbottomright').text('Zoom: ' + viewport.scale.toFixed(2));
    // });
    console.log(cornerstoneWADOImageLoader.webWorkerManager);
    if (!cornerstoneWADOImageLoader.webWorkerManager.isInitialized) {
      const config = {
        webWorkerPath : '/libs/imgViewer/cornerstoneWADOImageLoaderWebWorker.js',
        taskConfiguration: {
          'decodeTask' : {
            codecsPath: '/libs/imgViewer/cornerstoneWADOImageLoaderCodecs.js'
          }
        }
      };
      cornerstoneWADOImageLoader.webWorkerManager.initialize(config);
      cornerstoneWADOImageLoader.webWorkerManager.isInitialized = true;
    }
    // cornerstoneWADOImageLoader.configure({
    //   beforeSend: function(xhr) {
    //     // Add custom headers here (e.g. auth tokens)
    //     //xhr.setRequestHeader('APIKEY', 'my auth token');
    //   }
    // });
    this.loadImg();
    $('.list-group-item').removeClass('active');

    this.imageService.getSelectedImages().then(images => {
      this.images = images;
      console.log(this.images);
    });
    const jsonUrl = this.localUrlPrefix + `/data/images?format=json`;
    // const jsonUrl = `./../../assets/testData/testApi1.json`;
    setTimeout(() => {
      this.nodes = [];
      this.http.get(jsonUrl).toPromise().then((data) => {
        console.log(data);
        this.nodes = getNodesFormat(data.json());
      });
    }, 1);

    let carousel = $("#scrolling ul");
    console.log(carousel);
    carousel.itemslide(
      {
        swipe_out: true
      }
    );
    $(window).resize(function () {
      carousel.reload();
    }); //Recalculate width and center positions and sizes when window is resized
    this.imageUrl.forEach(n => {
      let testEl = document.getElementById(n.id);
      console.log(testEl);
      cornerstone.enable(testEl);
      cornerstone.loadImage(n.url).then(function(image) {
        cornerstone.displayImage(testEl, image);
      });
    });
    console.log(Polymer);
    // Polymer({
    //   'is': 'my-element',
    //   'ready': function () {
    //     console.log("ready");
    //   }
    // })
    console.log();
    // let ele = $('#my-element');
    // var listdivs = Polymer.dom (ele).children;
    // console.log(ele);
    // let testDom = this.testDom.nativeElement;
    // Polymer({
    //   is: 'my-element',
    //   ready: function () {
    //     console.log(this);
    //   }
    // })
    // image enable the elements
    // var mr0 = cornerstone.enable(document.getElementById('mr0'));
    // cornerstone.loadAndCacheImage('example://1').then(function(image) {
    //   cornerstone.displayImage(testDom, image);
    // });

    // var mr1 = cornerstone.enable(document.getElementById('mr1'));
    // var mr2 = cornerstone.enable(document.getElementById('mr2'));
    // var mr3 = cornerstone.enable(document.getElementById('mr3'));
    // var mr4 = cornerstone.enable(document.getElementById('mr4'));
    // console.log(document.getElementById('mr0'),$('#mr1'),document.getElementById('mr2'));
    // console.log(mr0,mr1,mr2);
    // load and display the images
    // cornerstone.loadAndCacheImage('example://1').then(function(image) {
    //   cornerstone.displayImage(mr1, image);
    // });
    // cornerstone.loadAndCacheImage('example://2').then(function(image) {
    //   cornerstone.displayImage(mr2, image);
    // });
    // cornerstone.loadAndCacheImage('example://1').then(function(image) {
    //   cornerstone.displayImage(mr3, image);
    // });
    // cornerstone.loadAndCacheImage('example://2').then(function(image) {
    //   cornerstone.displayImage(mr4, image);
    // });*/
  }

  onPolymerChange() {
    console.log("onPolymerChange");
    this.changeRef.detectChanges();
  }

  changeLayout(){
    this.isFourImageShown = !this.isFourImageShown;
    if (this.isFourImageShown === true) {
      var mr1 = cornerstone.enable(document.getElementById('mr1'));
      var mr2 = cornerstone.enable(document.getElementById('mr2'));
      var mr3 = cornerstone.enable(document.getElementById('mr3'));
      var mr4 = cornerstone.enable(document.getElementById('mr4'));
      // load and display the images
      cornerstone.loadAndCacheImage('example://1').then(function(image) {
        cornerstone.displayImage(mr1, image);
      });
      cornerstone.loadAndCacheImage('example://2').then(function(image) {
        cornerstone.displayImage(mr2, image);
      });
      cornerstone.loadAndCacheImage('example://1').then(function(image) {
        cornerstone.displayImage(mr3, image);
      });
      cornerstone.loadAndCacheImage('example://2').then(function(image) {
        cornerstone.displayImage(mr4, image);
      });
    }
  }

  loadImg(url?: string) {

    // ----------------------------- Annotation func start------------------------------------- //
    // Register the dialogs using the HTML5 Dialog Polyfill
    var annotationDialog = document.querySelector('#annotationDialog');
    var relabelDialog = document.querySelector('#relabelDialog');
    dialogPolyfill.registerDialog(annotationDialog);
    dialogPolyfill.registerDialog(relabelDialog);
    // Define a callback to get your text annotation
    // This could be used, e.g. to open a modal
    function getTextCallback(doneChangingTextCallback) {
      var annotationDialog  = $('#annotationDialog');
      var getTextInput = annotationDialog .find('.annotationTextInput');
      var confirm = annotationDialog .find('.annotationDialogConfirm');
console.log(annotationDialog);
      annotationDialog.showModal = function () {
        this[0].showModal();
      };
      annotationDialog.close = function () {
        this[0].close();
      };
      annotationDialog.showModal();
console.log(confirm);
      // confirm.off('click');
      confirm.on('click', function() {
        closeHandler();
      });

      annotationDialog.off("keydown");
      annotationDialog.on('keydown', keyPressHandler);

      function keyPressHandler(e) {
        // If Enter is pressed, close the dialog
        if (e.which === 13) {
          closeHandler();
        }
      }

      function closeHandler() {
        annotationDialog.close();
        doneChangingTextCallback(getTextInput.val());
        // Reset the text value
        getTextInput.val("");
      }
    }

    // Define a callback to edit your text annotation
    // This could be used, e.g. to open a modal
    function changeTextCallback(data, eventData, doneChangingTextCallback) {
      let relabelDialog = $('#relabelDialog');
      let getTextInput = relabelDialog.find('.annotationTextInput');
      let confirm = relabelDialog.find('.relabelConfirm');
      let remove = relabelDialog.find('.relabelRemove');

      relabelDialog.showModal = function () {
        this[0].showModal();
      };
      relabelDialog.close = function () {
        this[0].close();
      };

      getTextInput.val(data.annotationText);
      relabelDialog.showModal();

      // confirm.off('click');
      confirm.on('click', function() {
        relabelDialog.close();
        doneChangingTextCallback(data, getTextInput.val());
      });

      // If the remove button is clicked, delete this marker
      // remove.off('click');
      remove.on('click', function() {
        relabelDialog.close();
        doneChangingTextCallback(data, undefined, true);
      });

      relabelDialog.off("keydown");
      relabelDialog.on('keydown', keyPressHandler);

      function keyPressHandler(e) {
        // If Enter is pressed, close the dialog
        if (e.which === 13) {
          closeHandler();
        }
      }

      function closeHandler() {
        relabelDialog.close();
        doneChangingTextCallback(data, getTextInput.val());
        // Reset the text value
        getTextInput.val("");
      }

    }
    // ----------------------------- Annotation func end------------------------------------- //


    let imageId = url || this.imgUrl;
    console.log(imageId);
    const element = this.element;
    // './../../../../assets/img/dicom/1.dcm'
    // const canvas = $('canvas');
    // if (canvas) {
    //   console.log('canvas here');
    //   canvas.remove();
    // }
    // Load the image and enable tools

    let magnificationConfig = {
      magnifySize: 225,
      magnificationLevel: 2
    };
    let annotationConfig = {
      getTextCallback : getTextCallback,
      changeTextCallback : changeTextCallback,
      drawHandles : false,
      drawHandlesOnHover : true,
      arrowFirst : true
    };


    cornerstone.loadImage(imageId).then((image) => {
      cornerstone.displayImage(element, image);
      cornerstoneTools.magnify.setConfiguration(magnificationConfig);
      cornerstoneTools.arrowAnnotate.setConfiguration(annotationConfig);
      cornerstoneTools.mouseInput.enable(element);
      cornerstoneTools.magnify.enable(element);
      cornerstoneTools.mouseWheelInput.enable(element);
      cornerstoneTools.probe.enable(element);
      cornerstoneTools.length.enable(element);
      cornerstoneTools.ellipticalRoi.enable(element);
      cornerstoneTools.rectangleRoi.enable(element);
      cornerstoneTools.angle.enable(element);
      cornerstoneTools.highlight.enable(element);
      cornerstoneTools.simpleAngle.enable(element);

      // cornerstoneTools.pan.activate(element, 4);

      // cornerstoneTools.freehand.activate(element, 1);
      cornerstoneTools.zoomWheel.activate(element, 3); // zoom is the default tool for middle mouse wheel
      if (this.currentNode && this.localUrlPrefix) {
        this.loadLabelsState();
      }
    });
  }

  loadLabelsState() {
    const node = this.currentNode;
    const url = this.localUrlPrefix + '/data/labelinfos/' + node.parent.parent.data.name + '/' +
      node.parent.data.scanId + '/' + node.data.name;
    this.http.get(url).toPromise().then((res) => {
      const data = res.json();
      // data.then(function (d) {
      //   console.log(d);
      // })
      console.log(data);
      const savedState = data["ResultSet"]["content"]["label_info"];
      if (savedState) {
        this.disableAllTools();
        this.savedState = savedState;
        this.currentState = JSON.parse(this.savedState);
        cornerstoneTools.appState.restore(this.currentState);
        cornerstone.updateImage(this.element);
        this.historyStates = [];
        this.historyStates.push($.extend(true, {}, this.currentState));
        this.currentHistoryIndex = 0;
      }
    });
  }

  childrenCount(node: TreeNode): string {
    return node && node.children && node.children.length !== 0 ? `(${node.children.length})` : '';
  }

  filterNodes(text, tree) {
    tree.treeModel.filterNodes(text);
  }

  onEvent(event) {
    // console.log(event);
  }

  go($event) {
    $event.stopPropagation();
    alert('this method is on the app component');
  }

  activeNodes(treeModel) {
    console.log(treeModel.activeNodes);
  }

  disableAllTools() {
    const element = this.element;
    // cornerstoneTools.wwwc.disable(element);
    cornerstoneTools.pan.deactivate(element, 1); // 2 is middle mouse button
    cornerstoneTools.zoom.deactivate(element, 1); // 4 is right mouse button
    cornerstoneTools.probe.deactivate(element, 1);
    cornerstoneTools.length.deactivate(element, 1);
    cornerstoneTools.ellipticalRoi.deactivate(element, 1);
    cornerstoneTools.rectangleRoi.deactivate(element, 1);
    cornerstoneTools.angle.deactivate(element, 1);
    cornerstoneTools.highlight.deactivate(element, 1);
    cornerstoneTools.freehand.deactivate(element, 1);
    cornerstoneTools.magnify.deactivate(element, 1);
    cornerstoneTools.simpleAngle.deactivate(element, 1);
    cornerstoneTools.wwwc.deactivate(element, 1);
    cornerstoneTools.arrowAnnotate.deactivate(this.element, 1);
  }

  chooseType1() {
    activate('#rectangleroi1');
    this.disableAllTools();
    cornerstoneTools.toolColors.setToolColor('red');
    cornerstoneTools.freehand.activate(this.element, 1);
    // cornerstoneTools.rectangleRoi.setLabel('type1');
  }

  chooseType2() {
    activate('#rectangleroi2');
    this.disableAllTools();
    cornerstoneTools.toolColors.setToolColor('yellow');
    cornerstoneTools.freehand.activate(this.element, 1);
    // cornerstoneTools.rectangleRoi.setLabel('type2');
  }

  chooseType3() {
    activate('#rectangleroi3');
    this.disableAllTools();
    cornerstoneTools.toolColors.setToolColor('pink');
    cornerstoneTools.freehand.activate(this.element, 1);
    // cornerstoneTools.rectangleRoi.setLabel('type3');
  }

  chooseType4() {
    activate('#rectangleroi4');
    this.disableAllTools();
    cornerstoneTools.toolColors.setToolColor('greenyellow');
    cornerstoneTools.freehand.activate(this.element, 1);
    // cornerstoneTools.rectangleRoi.setLabel('type4');
  }

  chooseType5() {
    activate('#rectangleroi5');
    this.disableAllTools();
    cornerstoneTools.toolColors.setToolColor('orange');
    cornerstoneTools.freehand.activate(this.element, 1);
    // cornerstoneTools.rectangleRoi.setLabel('type5');
  }

  activatePan() {
    this.disableAllTools();
    cornerstoneTools.pan.activate(this.element, 1);
  }

  activateZoom() {
    this.disableAllTools();
    cornerstoneTools.zoom.activate(this.element, 1);
  }

  activateMagnification() {
    this.disableAllTools();
    cornerstoneTools.magnify.activate(this.element, 1);
  }

  activateSimpleAngle() {
    this.disableAllTools();
    cornerstoneTools.simpleAngle.activate(this.element, 1);
  }

  activateLength() {
    this.disableAllTools();
    cornerstoneTools.length.activate(this.element, 1);
  }

  activateProbe() {
    this.disableAllTools();
    cornerstoneTools.probe.activate(this.element, 1);
  }

  activateEllipticalROI() {
    this.disableAllTools();
    cornerstoneTools.ellipticalRoi.activate(this.element, 1);
  }

  activateRectangle() {
    this.disableAllTools();
    cornerstoneTools.rectangleRoi.activate(this.element, 1);
  }

  activateHighlight() {
    this.disableAllTools();
    cornerstoneTools.highlight.activate(this.element, 1);
  }
  activateWWWC() {
    this.disableAllTools();
    cornerstoneTools.wwwc.activate(this.element, 1);
  }
  activateAnnotation() {
    this.disableAllTools();
    cornerstoneTools.arrowAnnotate.activate(this.element, 1);
  }

  activateTool(id: string) {
    const element = this.element;
    activateTool('#' + id);
    if (id === "rightDrag") {
      cornerstoneTools.wwwc.deactivate(element, 4);
      cornerstoneTools.pan.activate(element, 4);
    } else {
      cornerstoneTools.pan.deactivate(element, 4);
      cornerstoneTools.wwwc.activate(element, 4);
    }
  }

  submit() {
    const labelsState = cornerstoneTools.appState.save([this.element]);
    const savedState = JSON.stringify(labelsState);

    console.log(this.currentNode);
    this.currentNode.data.isLabelDone = true;
    updateNodeState(this.currentNode.parent);
    updateNodeState(this.currentNode.parent.parent);
    updateNodeState(this.currentNode.parent.parent.parent);
    const node = this.currentNode;
    const labeledData = {
      exp_id: node.parent.parent.data.name,
      scan_id: node.parent.data.scanId,
      img_name: node.data.name,
      label_info: savedState,
      label_type: 'test_label_type'
    };

    const url = this.localUrlPrefix + '/data/labelinsert';

    const headers = new Headers({'Content-Type': 'application/json'});
    const options = new RequestOptions({ headers: headers});

    this.http.post(url, labeledData, options).toPromise().then(() => console.log('sended labelData'));

  }

  clear() {
    const element = this.element;
    const toolStateManager = cornerstoneTools.getElementToolStateManager(element);
    toolStateManager.clear(element);
    var configuration = {
      mouseLocation: {
        handles: {
          start: {
            highlight: true,
            active: true,
          }
        }
      },
      freehand: false,
      modifying: false,
      currentHandle: 0,
      currentTool: -1
    };
    cornerstoneTools.freehand.setConfiguration(configuration);
    cornerstone.updateImage(element);

    this.recordHistory();
  }

  // restore() {
  //   const appState = JSON.parse(this.savedState);
  //   cornerstoneTools.appState.restore(appState);
  //   cornerstone.updateImage(this.element);
  // }

  // dicomClicked(node: TreeNode) {
  //   this.currentNode = node;
  //   console.log(node);
  //   console.log(node.parent.children);
  // }
  recordHistory() {
    if (this.currentHistoryIndex !== this.historyStates.length - 1) {
      this.historyStates.splice(this.currentHistoryIndex, this.historyStates.length - this.currentHistoryIndex - 1);
    }
    this.currentState = cornerstoneTools.appState.save([this.element]);
    this.historyStates.push($.extend(true, {}, this.currentState));
    this.currentHistoryIndex++;
  }


  historyBack() {
    // this.historyStates.splice(this.currentHistoryIndex, 1);
    // this.recordHistory();
    if (this.currentHistoryIndex > 0) {
      this.currentHistoryIndex--;
    };
    this.currentState = this.historyStates[this.currentHistoryIndex];
    cornerstoneTools.appState.restore(this.currentState);
    cornerstone.updateImage(this.element);
  }
  historyForward() {
    // this.recordHistory();
    if (this.currentHistoryIndex < this.historyStates.length - 1) {
      this.currentHistoryIndex++;
    };
    this.currentState = this.historyStates[this.currentHistoryIndex];
    cornerstoneTools.appState.restore(this.currentState);
    cornerstone.updateImage(this.element);
  }

  switch(mode: String) {
    this.isMultiView = !this.isMultiView;
    if (this.isMultiView === false) {
      this.ngAfterViewInit();
    }
  }
  changeViewMode(event) {
    this.viewMode = this.viewMode === 'singleView' ? 'splitView' : 'singleView';
  }

}

function getNodesFormat(data: any): any {
  const allData = data.ResultSet.content;
  const newNodes = [];
  for (const k2 in allData) {
    if (allData.hasOwnProperty(k2)) {
      const fNode = {
        name: k2,
        children: [],
        isLabelDone: false
      }
      data = allData[k2];
      for (const k in data) {
        if (data.hasOwnProperty(k)) {
          const expNode = {
            name: k,
            subTitle: 'test',
            children: []
          };
          for (let i = 0; i < data[k].length; i++) {
            const scanNode = {
              name: 'ScanID-' + data[k][i].scan_id,
              children: [],
              isLabelDone: true,
              scanId: data[k][i].scan_id.toString(),
              hasChildren: true,
            };
            if (data[k][i].label_info === 'unlabel' || data[k][i].label_info === 'labeling') {
              scanNode.isLabelDone = false;
              fNode.isLabelDone = false;
            }
            // const imgs = data[k][i].images;
            // for (let j = 0; j < imgs.length; j++) {
            //     const imgNode = {
            //         name: imgs[j].img_name,
            //         labelState: imgs[j].img_label,
            //         url: imgs[j].img_uri,
            //         isLabelDone: true
            //     }
            //     console.log(imgs[i].img_label);
            //     if (imgs[j].img_label === 0) {
            //         imgNode.isLabelDone = false;
            //         scanNode.isLabelDone = false;
            //         fNode.isLabelDone = false;
            //     }
            //     scanNode.children.push(imgNode);
            // }
            expNode.children.push(scanNode);
          }
          fNode.children.push(expNode);
        }
      }
      newNodes.push(fNode);
    }
  }
  console.log(newNodes);
  return newNodes;
}

function activate(id: string): void {
  // $('.list-group-item').removeClass('active');
  // $(id).addClass('active');
}
function activateTool(id: string): void {
  // $('.active-tool').removeClass('active');
  // $(id).addClass('active');
}
function updateNodeState(node: TreeNode): void {
  if (!node.data.children) {
    return;
  }
  const nodeChildren = node.data.children;
  let isLabelDone = true;
  for (let i = 0; i < nodeChildren.length; i++) {
    if (nodeChildren[i].isLabelDone === false) {
      isLabelDone = false;
    }
  }
  node.data.isLabelDone = isLabelDone;
}
