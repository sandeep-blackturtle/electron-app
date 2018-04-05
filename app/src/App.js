//modules
const { ipcRenderer } = require('electron');
import React, {Component} from 'react'
import {render} from 'react-dom'
import axios from 'axios'
//components 
import Image from './components/Image/'
import ImageContainer from './components/ImageContainer/'
import Model from './components/Model/'
import Input from './components/Input/'
import Button from './components/Button/'
//configuration 
import {url, username, password} from './config/'
import {
    MESSAGE, 
    HANDLE_UPDATE, 
    ON_SUBMIT, 
    UPDATE_AVAILABLE, 
    UPDATE_NOT_AVAILABLE, 
    DOWNLOAD_UPDATE_ACCEPTED, 
    DOWNLOAD_UPDATE_DENIED, 
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
        ipcRenderer.on(HANDLE_UPDATE, this.handleAutoUpdate)
        ipcRenderer.on(UPDATE_AVAILABLE, this.handleUpdateAvailable)
    }

    componentWillUnmount() {
        ipcRenderer.removeListener(MESSAGE, this.showMessage)
        ipcRenderer.removeListener(UPDATE_AVAILABLE, this.handleUpdateAvailable)
        ipcRenderer.removeListener(HANDLE_UPDATE, this.handleAutoUpdate)
    }

    showMessage = (event, data) => {
        console.log('Message:::', data)
    }

    handleUpdateAvailable = () => {
        console.log('Update Available.......')
    }

    handleAutoUpdate = (event, data) => {
        console.log('LOG:::', data)
    }

    handleSubmit = () => {
        ipcRenderer.send(DOWNLOAD_UPDATE_ACCEPTED, 'Accepted......')
    }

    render() {
        return (
            <div>
                <ImageContainer data={this.state.data}/>
                <Model>
                    <Input type={'text'} lable={'Username'} name={'username'}/>
                    <Input type={'password'} lable={'Password'} name={'password'}/>
                    <Button className="submit" value={'Submit'} onClick={this.handleSubmit}/>
                </Model>
            </div>
        )
    }
}

export default App
