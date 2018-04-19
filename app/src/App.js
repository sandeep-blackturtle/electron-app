// NPM Modules
import axios from 'axios';
import React, { Component } from 'react';
import { ipcRenderer } from 'electron';
// Components
import Model from './components/Model/';
import Input from './components/Input/';
import Alert from './components/Alert/';
import Button from './components/Button/';
import RenderFiles from './components/RenderFiles/';
// Configuration
import { url } from './config/';
// Constants
import {
    // Events
    MESSAGE,
    STORED_DATA,
    LOGIN_SUCCESS,
    GET_STORED_DATA,
    NEW_CONTENT_CHECK,
    NEW_CONTENT_DOWNLOAD,
    NEW_CONTENT_AVAILABLE,
    APP_UPDATE_PERMISSION,
    UPDATE_DOWNLOAD_COMPLETE,
    // Status
    STATUS_CLOSE_ALERT,
    STATUS_NEW_CONTENT_NO,
    STATUS_NEW_CONTENT_YES,
    // Messages
    MESSAGE_NO_CONTENT,
    MESSAGE_LOGIN_SUCCESS,
    MESSAGE_UPDATE_AVAILABLE,
    MESSAGE_INVALID_CREDENCIALS,
    MESSAGE_NEW_CONTENT_AVAILABLE,
    MESSAGE_NEW_CONTENT_NOT_AVAILABLE,
    MESSAGE_NEW_CONTENT_WILL_DOWNLOAD,
} from './utils/constants';

class App extends Component {

    constructor(props) {
        super(props);

        this.state = {
            message: '',
            username: '',
            password: '',
            storedData: [],
            authStatus: null,
            newUpdate: false,
            newContent: null,
            newContentCheck: false,
            acceptContentDownload: false,
        };

        this.handleStoredData = this.handleStoredData.bind(this);
        this.handleModelClose = this.handleModelClose.bind(this);
        this.handleAlertClose = this.handleAlertClose.bind(this);
        this.handleShowMessage = this.handleShowMessage.bind(this);
        this.handleGetStoredData = this.handleGetStoredData.bind(this);
        this.handleNewContentCheck = this.handleNewContentCheck.bind(this);
        this.handleInputValueChange = this.handleInputValueChange.bind(this);
        this.handleUpdateDownloaded = this.handleUpdateDownloaded.bind(this);
        this.handleNewContentAvailable = this.handleNewContentAvailable.bind(this);
        this.handleAcceptUpdateInstall = this.handleAcceptUpdateInstall.bind(this);
        this.handleDeniedUpdateInstall = this.handleDeniedUpdateInstall.bind(this);
        this.handleValidateCredencials = this.handleValidateCredencials.bind(this);
        this.handleAlertNewContentStatus = this.handleAlertNewContentStatus.bind(this);
        this.handleAccepNewContentDownload = this.handleAccepNewContentDownload.bind(this);
        this.handleDeniedNewContentDownload = this.handleDeniedNewContentDownload.bind(this);
    }

    componentDidMount() {
        ipcRenderer.on(MESSAGE, this.handleShowMessage);
        ipcRenderer.on(STORED_DATA, this.handleStoredData);
        ipcRenderer.on(NEW_CONTENT_CHECK, this.handleNewContentCheck);
        ipcRenderer.on(NEW_CONTENT_AVAILABLE, this.handleNewContentAvailable);
        ipcRenderer.on(UPDATE_DOWNLOAD_COMPLETE, this.handleUpdateDownloaded);

        this.handleGetStoredData();
    }

    componentWillUnmount() {
        ipcRenderer.removeListener(MESSAGE, this.handleShowMessage);
        ipcRenderer.removeListener(STORED_DATA, this.handleStoredData);
        ipcRenderer.removeListener(NEW_CONTENT_CHECK, this.handleNewContentCheck);
        ipcRenderer.removeListener(NEW_CONTENT_AVAILABLE, this.handleNewContentAvailable);
        ipcRenderer.removeListener(UPDATE_DOWNLOAD_COMPLETE, this.handleUpdateDownloaded);
    }

    handleShowMessage(event, data) {
        console.log('Message:', data);
        this.setState({ message: data });
    }

    handleGetStoredData() {
        ipcRenderer.send(GET_STORED_DATA);
    }

    handleNewContentCheck() {
        this.setState({ newContentCheck: true });
    }

    handleNewContentAvailable(event, status) {
        if (status !== STATUS_NEW_CONTENT_YES) {
            this.setState({ newContent: STATUS_NEW_CONTENT_NO });
        }

        this.setState({ newContent: status });
    }

    handleStoredData(event, data) {
        this.setState({ storedData: data });
    }

    handleAccepNewContentDownload(status) {
        const credentials = {
            username: this.state.username,
            password: this.state.password,
        };

        this.setState({
            newContent: false,
            acceptContentDownload: status,
        });

        ipcRenderer.send(NEW_CONTENT_DOWNLOAD, credentials);
    }

    handleDeniedNewContentDownload(status) {
        this.setState({ newContent: status });
    }

    handleInputValueChange(event) {
        this.setState({
            [event.target.name]: event.target.value,
        });
    }

    // event with wrong credentials able to access the data, not sure why
    handleValidateCredencials() {
        axios.get(url, {
            auth: {
                username: this.state.username,
                password: this.state.password,
            },
        })
        .then((res) => {
            const data = res.data.data;
            this.setState({ authStatus: MESSAGE_LOGIN_SUCCESS });

            setTimeout(() => {
                this.setState({ newContentCheck: false });
                ipcRenderer.send(LOGIN_SUCCESS, data);
            }, 2500);
        })
        .catch(() => {
            this.setState({
                authStatus: MESSAGE_INVALID_CREDENCIALS,
            });
        });
    }

    handleModelClose() {
        this.setState({ newContentCheck: false });
    }

    handleAlertClose(status) {
        this.setState({ newContent: status });
    }

    handleUpdateDownloaded() {
        // console.log('Downloaded complete:', data);
        this.setState({ newUpdate: true });
    }

    handleAcceptUpdateInstall(status) {
        this.setState({
            newUpdate: false,
            acceptContentDownload: status,
        });
        ipcRenderer.send(APP_UPDATE_PERMISSION, true);
    }

    handleDeniedUpdateInstall(status) {
        this.setState({ newUpdate: status });
    }

    // Conditionally display newContent alert
    handleAlertNewContentStatus() {
        switch (this.state.newContent) {
        case STATUS_NEW_CONTENT_YES:
            return (
                <Alert value={MESSAGE_NEW_CONTENT_AVAILABLE}>
                    <Button
                        className="cancel-button"
                        value={'Cancel'}
                        onClick={() => this.handleDeniedNewContentDownload(STATUS_CLOSE_ALERT)}
                    />
                    <Button
                        className="update-button"
                        value={'Download'}
                        onClick={() => this.handleAccepNewContentDownload(STATUS_CLOSE_ALERT)}
                    />
                </Alert>
            );
        case STATUS_NEW_CONTENT_NO:
            return (
                <Alert value={MESSAGE_NEW_CONTENT_NOT_AVAILABLE}>
                    <Button
                        className="cancel-button"
                        value={'Close'}
                        onClick={() => this.handleAlertClose(STATUS_CLOSE_ALERT)}
                    />
                </Alert>
            );
        default:
            return null;
        }
    }

    render() {
        return (
            <div className="app">
                {this.handleAlertNewContentStatus()}
                {this.state.newUpdate ?
                    <Alert value={MESSAGE_UPDATE_AVAILABLE}>
                        <Button className="cancel-button" value={'Cancel'} onClick={() => this.handleDeniedUpdateInstall(false)} />
                        <Button className="update-button" value={'Update'} onClick={() => this.handleAcceptUpdateInstall(true)} />
                    </Alert>
                    : null
                }
                {this.state.storedData.length > 0
                    ? <RenderFiles data={this.state.storedData} />
                    : <h3 className="text-center">{MESSAGE_NO_CONTENT}</h3>
                }
                {this.state.newContentCheck ?
                    <Model
                        title={this.state.authStatus}
                        titleClassName={this.state.authStatus === MESSAGE_INVALID_CREDENCIALS ? 'error' : 'success'}
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
                        <Button
                            type={'button'}
                            className="submit-button"
                            value={'Submit'}
                            onClick={this.handleValidateCredencials}
                            disabled={!this.state.username || !this.state.password}
                        />
                        <Button type={'button'} className="model-close" value={'X'} onClick={this.handleModelClose} />
                    </Model>
                    : null
                }
            </div>
        );
    }
}

export default App;
