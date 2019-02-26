import React, { Component } from 'react';
import {
  View, Text, StyleSheet, ScrollView, Alert,
  Image, TouchableOpacity, NativeModules, Dimensions, Button, CheckBox
} from 'react-native';

import ActionButton from 'react-native-action-button';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import Video from 'react-native-video';

import RNFetchBlob from 'rn-fetch-blob';

import SpinnerButton from 'react-native-spinner-button';

var ImagePicker = NativeModules.ImageCropPicker;

const styles = StyleSheet.create({
  actionButtonIcon: {
    fontSize: 24,
    height: 25,
    color: 'white',
  },
  container: {
    flex: 1,
    margin: 5,
    justifyContent: 'center',
    alignItems: 'center'
  },
  text: {
    color: 'black',
    fontSize: 10,
    textAlign: 'center',
    marginBottom: 10,
    marginTop: 5
  },
  spinnerButtonText: {
    fontSize: 18,
    textAlign: 'center',
    color: 'white',
    paddingHorizontal: 10,
  },
  spinnerButtonStyle: {
    borderRadius: 10,
    margin: 10,
  }
});

export default class App extends Component {
  constructor() {
    super();
    this.state = {
      image: null,
      images: null,
      algo1: false,
      algo2: false,
      algo3: false,
      algo1res: '',
      algo2res: '',
      algo3res: '',
      algo1running: false,
      algo2running: false,
      algo3running: false
    };
  }

  pickSingleWithCamera(cropping) {
    ImagePicker.openCamera({
      cropping: cropping,
      width: 500,
      height: 100,
      includeExif: true,
      freeStyleCropEnabled: true,
      enableRotationGesture: true,
    }).then(image => {
      console.log('received image', image);
      this.setState({
        image: { uri: image.path, width: image.width, height: image.height },
        images: null
      });
    }).catch(e => alert(e));
  }

  cleanupImages() {
    ImagePicker.clean().then(() => {
      console.log('removed tmp images from tmp directory');
      this.setState({
        image: null,
        images: null
      });
    }).catch(e => {
      alert(e);
    });
  }

  cropLast() {
    if (!this.state.image) {
      return Alert.alert('No image', 'Before open cropping only, please select image');
    }

    ImagePicker.openCropper({
      path: this.state.image.uri,
      freeStyleCropEnabled: true,
      enableRotationGesture: true,
      width: 500,
      height: 100
    }).then(image => {
      console.log('received cropped image', image);
      this.setState({
        image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
        images: null
      });
    }).catch(e => {
      console.log(e);
      Alert.alert(e.message ? e.message : e);
    });
  }

  pickSingle(cropit, circular = false) {
    ImagePicker.openPicker({
      width: 500,
      height: 100,
      cropping: cropit,
      cropperCircleOverlay: circular,
      freeStyleCropEnabled: true,
      enableRotationGesture: true,
      compressImageMaxWidth: 640,
      compressImageMaxHeight: 480,
      compressImageQuality: 0.5,
      compressVideoPreset: 'MediumQuality',
      includeExif: true,
    }).then(image => {
      console.log('received image', image);
      this.setState({
        image: { uri: image.path, width: image.width, height: image.height, mime: image.mime },
        images: null
      });
    }).catch(e => {
      console.log(e);
      Alert.alert(e.message ? e.message : e);
    });
  }

  pickMultiple() {
    ImagePicker.openPicker({
      multiple: true,
      waitAnimationEnd: false,
      includeExif: true,
      forceJpg: true,
    }).then(images => {
      this.setState({
        image: null,
        images: images.map(i => {
          console.log('received image', i);
          return { uri: i.path, width: i.width, height: i.height, mime: i.mime };
        })
      });
    }).catch(e => alert(e));
  }

  scaledHeight(oldW, oldH, newW) {
    return (oldH / oldW) * newW;
  }

  renderVideo(video) {
    return (<View style={{ height: 300, width: 300 }}>
      <Video source={{ uri: video.uri, type: video.mime }}
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          bottom: 0,
          right: 0
        }}
        rate={1}
        paused={false}
        volume={1}
        muted={false}
        resizeMode={'cover'}
        onError={e => console.log(e)}
        onLoad={load => console.log(load)}
        repeat={true} />
    </View>);
  }

  renderImage(image) {
    return <Image style={{ width: 300, height: 300, resizeMode: 'contain' }} source={image} />
  }

  renderAsset(image) {
    if (image.mime && image.mime.toLowerCase().indexOf('video/') !== -1) {
      return this.renderVideo(image);
    }

    return this.renderImage(image);
  }

  render() {
    return (<View style={styles.container}>
      <ScrollView>
        {this.state.image ? this.renderAsset(this.state.image) : null}
        {this.state.images ? this.state.images.map(i => <View key={i.uri}>{this.renderAsset(i)}</View>) : null}
      </ScrollView>

      <View style={{ flexDirection: 'column', marginBottom: 70 }}>
        <View style={{ flexDirection: 'row' }}>
          <CheckBox
            value={this.state.algo1}
            onValueChange={() => this.setState({ algo1: !this.state.algo1 })}
          />
          <Text style={{ marginTop: 5 }}>Tesseract</Text>
        </View>
        <Text style={{ marginBottom: 10 }}>{this.state.algo1res}</Text>
        <View style={{ flexDirection: 'row' }}>
          <CheckBox
            value={this.state.algo2}
            onValueChange={() => this.setState({ algo2: !this.state.algo2 })}
          />
          <Text style={{ marginTop: 5 }}>Kraken</Text>
        </View>
        <Text style={{ marginBottom: 10 }}>{this.state.algo2res}</Text>
        <View style={{ flexDirection: 'row' }}>
          <CheckBox
            value={this.state.algo3}
            onValueChange={() => this.setState({ algo3: !this.state.algo3 })}
          />
          <Text style={{ marginTop: 5 }}>Ocropy</Text>
        </View>
        <Text style={{ marginBottom: 10 }}>{this.state.algo3res}</Text>
      </View>

      <SpinnerButton
        spinnerType='BarIndicator'
        buttonStyle={styles.spinnerButtonStyle}
        isLoading={this.state.algo1running || this.state.algo2running || this.state.algo3running}
        onPress={() => {

          this.setState({ algo1res: '', algo2res: '', algo3res: '' })

          if (!this.state.image) {
            Alert.alert('Warning', 'Please choose an image first!')
          } else {


            if (!this.state.algo1 && !this.state.algo2 && !this.state.algo3) {
              Alert.alert('Warning', 'Please select at least one algorithm above!')
            } else {

              if (this.state.algo1) {
                this.setState({ algo1running: true })
                RNFetchBlob.config({
                  trusty: true
                })
                  .fetch('POST', 'https://capstone-project-heroku2.herokuapp.com/api/tesseract/', {
                    'Content-Type': 'multipart/form-data'
                  }, [
                      { name: 'image', filename: 'data.jpg', type: 'image/foo', data: RNFetchBlob.wrap(this.state.image.uri) }
                    ]).then((resp) => {
                      var tmp = JSON.parse(resp.data)
                      this.setState({ algo1res: JSON.stringify(tmp.data) })
                      this.setState({ algo1running: false })
                    }).catch((err) => {
                    })
              }

              if (this.state.algo2) {
                this.setState({ algo2running: true })
                RNFetchBlob.config({
                  trusty: true
                })
                  .fetch('POST', 'https://capstone-project-heroku2.herokuapp.com/api/kraken/', {
                    'Content-Type': 'multipart/form-data'
                  }, [
                      { name: 'image', filename: 'data.jpg', type: 'image/foo', data: RNFetchBlob.wrap(this.state.image.uri) }
                    ]).then((resp) => {
                      var tmp = JSON.parse(resp.data)
                      this.setState({ algo2res: JSON.stringify(tmp.data) })
                      this.setState({ algo2running: false })
                    }).catch((err) => {
                    })
              }

              if (this.state.algo3) {
                this.setState({ algo3running: true })
                RNFetchBlob.config({
                  trusty: true
                })
                  .fetch('POST', 'https://capstone-project-heroku2.herokuapp.com/api/ocropy/', {
                    'Content-Type': 'multipart/form-data'
                  }, [
                      { name: 'image', filename: 'data.jpg', type: 'image/foo', data: RNFetchBlob.wrap(this.state.image.uri) }
                    ]).then((resp) => {
                      var tmp = JSON.parse(resp.data)
                      this.setState({ algo3res: JSON.stringify(tmp.data) })
                      this.setState({ algo3running: false })
                    }).catch((err) => {
                    })
              }
            }
          }
        }}>
        <Text style={styles.spinnerButtonText}>Perform Recognition</Text>
      </SpinnerButton>

      <ActionButton buttonColor="rgba(231,76,60,1)" offsetY={50} offsetX={25}>
        <ActionButton.Item buttonColor='#9b59b6' title='From camera' onPress={() => this.pickSingleWithCamera(true)}>
          <IconMaterial name='camera-alt' style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#1abc9c' title='From file' onPress={() => this.pickSingle(false)}>
          <IconMaterial name='image' style={styles.actionButtonIcon} />
        </ActionButton.Item>
        {/*
        <ActionButton.Item buttonColor='#3498db' title='From multiple files' onPress={() => this.pickMultiple()}>
          <IconMaterial name='image' style={styles.actionButtonIcon} />
        </ActionButton.Item>
		    */}
        <ActionButton.Item buttonColor='#ef6c00' title='Crop last selected' onPress={() => this.cropLast()}>
          <IconMaterial name='crop' style={styles.actionButtonIcon} />
        </ActionButton.Item>
        <ActionButton.Item buttonColor='#546e7a' title='Clean' onPress={() => this.cleanupImages()}>
          <IconMaterial name='delete' style={styles.actionButtonIcon} />
        </ActionButton.Item>
      </ActionButton>
    </View>);
  }
}
