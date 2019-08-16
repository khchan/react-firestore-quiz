import React from 'react';
import '../styles/Buttons.css';
import '../styles/CharacterSelect.css';
import { Profiles } from '../constants/Profiles.js';

class CharacterSelect extends React.Component {

    state = {
        selectedProfile: null,
        profiles: []
    }

    toggleCharacterSelect(profile) {
        if (this.state.selectedProfile && this.state.selectedProfile.img === profile.img) {
            this.setState({selectedProfile: null});
        } else {
            this.setState({selectedProfile: profile});
        }
    }

    filterProfiles = (event) => {
        let filtered = Profiles.filter(profile => {
            let profileName = profile.firstName.toLowerCase() + profile.lastName.toLowerCase() + profile.association.toLowerCase()
            return profileName.indexOf(event.target.value.toLowerCase()) !== -1;
        });

        this.setState({ profiles: filtered });
    }

    componentDidMount() {
        this.setState({profiles: Profiles});
    }

    mapProfileToCard(state, profile) {
        let isCharacterSelected = state.selectedProfile && (profile.img === state.selectedProfile.img);
        const profileName = `${profile.firstName}-${profile.lastName}`;
        const profileSelected = isCharacterSelected ? 'card-img-pulsate' : '';
        const selectedProfileName = isCharacterSelected ? 'selected-profile-name' : '';

        return (
            <div className='card' key={profileName} onClick={() => this.toggleCharacterSelect(profile)}>
                <img alt='Avatar' className={profileSelected} src={profile.img}></img>
                <div className='text'>
                    <span className={selectedProfileName}>{profile.firstName}<br />{profile.lastName}</span>
                </div>
            </div>
        );
    }

    render() {
        let self = this;
        const selectedProfile = this.state.selectedProfile;
        const profileFullName = selectedProfile ? <h2>{selectedProfile.firstName} {selectedProfile.lastName}</h2> : null;

        return (
            <div className='character-select-container'>
                <input type='text' className={`search ${selectedProfile ? 'hide' : ''}`} 
                       placeholder='Search' onChange={this.filterProfiles} />
                {profileFullName}
                <div className="cards">{this.state.profiles.map(profile => this.mapProfileToCard(this.state, profile))}</div>
            </div>
        );
    }
}

export default CharacterSelect;