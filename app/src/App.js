// NPM Modules
import axios from 'axios'
import React, { Component } from 'react'
import { render } from 'react-dom'
const { ipcRenderer } = require('electron');
// Components 
import Image from './components/Image/'
import Model from './components/Model/'
import Input from './components/Input/'
import Button from './components/Button/'
import ImageContainer from './components/ImageContainer/'
// Configuration 
import {url, username, password} from './config/'
// Constants
import {
    MESSAGE, 
    UPDATE_AVAILABLE, 
    CHECKING_FOR_UPDATE,
    UPDATE_NOT_AVAILABLE, 
    DOWNLOAD_UPDATE_DENIED, 
    DOWNLOAD_UPDATE_ACCEPTED, 
    UPDATE_DOWNLOAD_PROGRESS, 
} from "./utils/constants";

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            update: ''
        };
    }

    componentDidMount() {
        axios.get(url).then(res => {
            this.setState({ data: res.data })
        });

        ipcRenderer.on(MESSAGE, this.showMessage)
        ipcRenderer.on(UPDATE_AVAILABLE, this.handleUpdateAvailable)
        ipcRenderer.on(CHECKING_FOR_UPDATE, this.handleCheckingForUpdate)
        ipcRenderer.on(UPDATE_NOT_AVAILABLE, this.handleUpdateNotAvailable)
        ipcRenderer.on(UPDATE_DOWNLOAD_PROGRESS, this.handleUpdateDownloadProgress)
    }

    componentWillUnmount() {
        ipcRenderer.removeListener(MESSAGE, this.showMessage)
        ipcRenderer.removeListener(UPDATE_AVAILABLE, this.handleUpdateAvailable)
        ipcRenderer.removeListener(CHECKING_FOR_UPDATE, this.handleCheckingForUpdate)
        ipcRenderer.removeListener(UPDATE_NOT_AVAILABLE, this.handleUpdateNotAvailable)
        ipcRenderer.removeListener(UPDATE_DOWNLOAD_PROGRESS, this.handleUpdateDownloadProgress)
    }

    showMessage = (event, data) => {
        console.log('Message:::', data)
    }

    handleCheckingForUpdate = (event, data) => {
        console.log('CHECK::', data)
    }

    handleUpdateAvailable = (event, data) => {
        console.log('UPA::', data)
    }

    handleUpdateNotAvailable = (event, data) => {
        console.log('UPNA::', data)
    }

    handleAcceptUpdateDownload = () => {
        console.log('Accepted::')
        ipcRenderer.send(DOWNLOAD_UPDATE_ACCEPTED, 'Accepted......')
    }

    handleUpdateDownloadProgress = (event, data) => {
        console.log( `Downloaded ${Math.round(data.percent)}%`)
    }

    render() {
        return (
            <div>
                <ImageContainer data={this.state.data}/>
                <Model>
                    <Input type={'text'} lable={'Username'} name={'username'}/>
                    <Input type={'password'} lable={'Password'} name={'password'}/>
                    <Button className="submit" value={'Submit'} onClick={this.handleAcceptUpdateDownload}/>
                </Model>
            </div>
        )
    }
}

export default App
