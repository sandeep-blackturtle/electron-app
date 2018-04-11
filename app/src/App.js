// NPM Modules
import axios from 'axios';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
// Components
import Model from './components/Model/';
import Input from './components/Input/';
import Alert from './components/Alert/';
import Button from './components/Button/';
import ImageContainer from './components/ImageContainer/';
// Configuration
import { url, username, password } from './config/';
// Constants
import {
    MESSAGE,
    STORE_DATA,
    STORED_DATA,
    APP_IS_OFFLINE,
    NEW_CONTENT_DOWNLOAD,
    NEW_CONTENT_AVAILABLE,
    APP_UPDATE_PERMISSION,
    UPDATE_DOWNLOAD_COMPLETE,
    MESSAGE_UPDATE_AVAILABLE,
    MESSAGE_INVALID_CREDENCIALS,
    MESSAGE_UPDATE_WILL_INSTALL_NOW,
} from './utils/constants';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            data: [],
            message: '',
            username: '',
            password: '',
            offline: false,
            offlineData: [],
            authStatus: null,
            newUpdate: false,
            newContent: false,
            acceptUpdateInstall: false,
        };

        this.handleStoreData = this.handleStoreData.bind(this);
        this.handleStoredData = this.handleStoredData.bind(this);
        this.handleModelClose = this.handleModelClose.bind(this);
        this.handleShowMessage = this.handleShowMessage.bind(this);
        this.handleInputValueChange = this.handleInputValueChange.bind(this);
        this.handleUpdateDownloaded = this.handleUpdateDownloaded.bind(this);
        this.handleAcceptUpdateInstall = this.handleAcceptUpdateInstall.bind(this);
        this.handleDeniedUpdateInstall = this.handleDeniedUpdateInstall.bind(this);
        this.handleValidateCredencials = this.handleValidateCredencials.bind(this);
        this.handleCheckNetworkConnection = this.handleCheckNetworkConnection.bind(this);
    }

    componentDidMount() {
        axios.get(url).then((res) => {
            const data = res.data;
            this.setState({ data: data.data });
            this.handleStoreData(data.data);
        });

        ipcRenderer.on(MESSAGE, this.handleShowMessage);
        ipcRenderer.on(STORED_DATA, this.handleStoredData);
        ipcRenderer.on(NEW_CONTENT_AVAILABLE, this.handleNewContentAvailable);
        ipcRenderer.on(UPDATE_DOWNLOAD_COMPLETE, this.handleUpdateDownloaded);

        this.handleCheckNetworkConnection();
    }

    componentWillUnmount() {
        ipcRenderer.removeListener(MESSAGE, this.handleShowMessage);
        ipcRenderer.removeListener(STORED_DATA, this.handleStoredData);
        ipcRenderer.removeListener(NEW_CONTENT_AVAILABLE, this.handleNewContentAvailable);
        ipcRenderer.removeListener(UPDATE_DOWNLOAD_COMPLETE, this.handleUpdateDownloaded);
    }

    handleCheckNetworkConnection() {
        if (navigator.onLine) {
            this.setState({ offline: false });
            ipcRenderer.send(APP_IS_OFFLINE, true);
        } else {
            this.setState({ offline: true });
            ipcRenderer.send(APP_IS_OFFLINE, true);
        }
    }

    handleNewContentAvailable(event, data) {
        console.log('newContent', data);
    }

    handleNewContentDownload() {
        console.log('newContentDownload');
    }

    handleStoreData(data) {
        if (data.length > 0) {
            ipcRenderer.send(STORE_DATA, data);
        }
    }

    handleStoredData(event, data) {
        this.setState({ offlineData: data });
    }

    handleShowMessage(event, data) {
        console.log('Message:', data);
        this.setState({ message: data });
    }

    handleUpdateDownloaded() {
        // console.log('Downloaded complete:', data);
        this.setState({ newUpdate: true });
    }

    handleAcceptUpdateInstall(install) {
        this.setState({
            newUpdate: false,
            acceptUpdateInstall: install,
        });
    }

    handleDeniedUpdateInstall(install) {
        this.setState({ newUpdate: install });
    }

    handleInputValueChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    handleValidateCredencials() {
        if (username !== this.state.username || password !== this.state.password) {
            this.setState({
                authStatus: MESSAGE_INVALID_CREDENCIALS,
            });
        } else {
            this.setState({
                authStatus: MESSAGE_UPDATE_WILL_INSTALL_NOW,
            });

            setTimeout(() => {
                this.setState({
                    acceptUpdateInstall: false,
                });
                ipcRenderer.send(APP_UPDATE_PERMISSION, true);
            }, 2500);
        }
    }

    handleModelClose() {
        this.setState({
            acceptUpdateInstall: false,
        });
    }

    render() {
        return (
            <div className="app">
                {this.state.newUpdate ?
                    <Alert value={MESSAGE_UPDATE_AVAILABLE}>
                        <Button className="cancel-button" value={'Cancel'} onClick={() => this.handleDeniedUpdateInstall(false)} />
                        <Button className="update-button" value={'Update'} onClick={() => this.handleAcceptUpdateInstall(true)} />
                    </Alert>
                    : null
                }
                <ImageContainer data={this.state.offline ? this.state.offlineData : this.state.offlineData} />
                {this.state.acceptUpdateInstall ?
                    <Model
                        title={this.state.authStatus}
                        titleClassName={this.state.authStatus === INVALID_CREDENCIALS ? 'error' : 'success'}
                    >
                        <Input
                            type={'text'}
                            lable={'Username'}
                            name={'username'}
                            value={this.state.username}
                            onChange={this.handleInputValueChange}
                        />
                        <Input
                            type={'password'}
                            lable={'Password'}
                            name={'password'}
                            value={this.state.password}
                            onChange={this.handleInputValueChange}
                        />
                        <Button type={'button'} className="submit-button" value={'Submit'} onClick={this.handleValidateCredencials} />
                        <Button type={'button'} className="model-close" value={'X'} onClick={this.handleModelClose} />
                    </Model>
                    : null
                }
            </div>
        );
    }
}

export default App;
