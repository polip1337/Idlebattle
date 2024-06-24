import Member from './Member.js';

class Team {
    constructor(name, teamContainerId) {
        this.name = name;
        this.members = [];
        this.teamContainer = document.getElementById(teamContainerId);
    }

    getFirstAliveMember() {
        const aliveMembers = this.members.filter(member => member.currentHealth > 0);

        if (aliveMembers.length > 0) {
            return aliveMembers[0];
        }
    }

    getRandomAliveMember() {
        const aliveMembers = this.members.filter(member => member.currentHealth > 0);

        if (aliveMembers.length > 0) {
            const randomIndex = Math.floor(Math.random() * aliveMembers.length);
            return aliveMembers[randomIndex];
        }
    }

    getLowestHPMember() {
        const aliveMembers = this.members.filter(member => member.currentHealth > 0);

        if (aliveMembers.length > 0) {
            return aliveMembers.reduce((lowestHPMember, currentMember) => {
                if (currentMember.currentHealth < lowestHPMember.currentHealth) {
                    return currentMember;
                }
                return lowestHPMember;
            }, aliveMembers[0]);
        }
    }

    getHighestHPMember() {
        const aliveMembers = this.members.filter(member => member.currentHealth > 0);

        if (aliveMembers.length > 0) {
            return aliveMembers.reduce((highestHPMember, currentMember) => {
                if (currentMember.currentHealth > highestHPMember.currentHealth) {
                    return currentMember;
                }
                return highestHPMember;
            }, aliveMembers[0]);
        }
    }

    getFrontMember(index) {
        const frontMembers = this.members.filter(member => member.position === 'Front');

        if (frontMembers.length >= index) {
            return frontMembers[index - 1];
        }
    }

    getBackMember(index) {
        const backMembers = this.members.filter(member => member.position === 'back');

        if (backMembers.length >= index) {
            return backMembers[index - 1];
        }
    }

    getAllFrontMembers() {
        return this.members.filter(member => member.position === 'Front');
    }

    getAllBackMembers() {
        return this.members.filter(member => member.position === 'back');
    }

    getAllAliveMembers() {
        return this.members.filter(member => member.currentHealth > 0);
    }

    addMembers(members) {
        this.members = members.map((member, index) => {
            member.memberId = `${this.name.toLowerCase()}-member${index}`;
            return member;
        });
    }
    addMember(member) {
        member.memberId = `${this.name.toLowerCase()}-member${this.members.length}`;
        this.members.push(member);
    }
    getRandomFrontMember() {
        const frontMembers = this.members.filter(member => member.position === 'Front' && member.currentHealth > 0);

        if (frontMembers.length > 0) {
            const randomIndex = Math.floor(Math.random() * frontMembers.length);
            return frontMembers[randomIndex];
        }
    }

    getRandomBackMember() {
        const backMembers = this.members.filter(member => member.position === 'back' && member.currentHealth > 0);

        if (backMembers.length > 0) {
            const randomIndex = Math.floor(Math.random() * backMembers.length);
            return backMembers[randomIndex];
        }
    }

    getLowestHPFrontMember() {
        const frontMembers = this.members.filter(member => member.position === 'Front' && member.currentHealth > 0);

        if (frontMembers.length > 0) {
            return frontMembers.reduce((lowestHPMember, currentMember) => {
                if (currentMember.currentHealth < lowestHPMember.currentHealth) {
                    return currentMember;
                }
                return lowestHPMember;
            }, frontMembers[0]);
        }
    }

    getLowestHPBackMember() {
        const backMembers = this.members.filter(member => member.position === 'back' && member.currentHealth > 0);

        if (backMembers.length > 0) {
            return backMembers.reduce((lowestHPMember, currentMember) => {
                if (currentMember.currentHealth < lowestHPMember.currentHealth) {
                    return currentMember;
                }
                return lowestHPMember;
            }, backMembers[0]);
        }
    }

    getLowestHPMember() {
        const aliveMembers = this.members.filter(member => member.currentHealth > 0);

        if (aliveMembers.length > 0) {
            return aliveMembers.reduce((lowestHPMember, currentMember) => {
                if (currentMember.currentHealth < lowestHPMember.currentHealth) {
                    return currentMember;
                }
                return lowestHPMember;
            }, aliveMembers[0]);
        }
    }

    getHighestHPFrontMember() {
        const frontMembers = this.members.filter(member => member.position === 'Front' && member.currentHealth > 0);

        if (frontMembers.length > 0) {
            return frontMembers.reduce((highestHPMember, currentMember) => {
                if (currentMember.currentHealth > highestHPMember.currentHealth) {
                    return currentMember;
                }
                return highestHPMember;
            }, frontMembers[0]);
        }
    }

    getHighestHPBackMember() {
        const backMembers = this.members.filter(member => member.position === 'back' && member.currentHealth > 0);

        if (backMembers.length > 0) {
            return backMembers.reduce((highestHPMember, currentMember) => {
                if (currentMember.currentHealth > highestHPMember.currentHealth) {
                    return currentMember;
                }
                return highestHPMember;
            }, backMembers[0]);
        }
    }

    getHighestHPMember() {
        const aliveMembers = this.members.filter(member => member.currentHealth > 0);

        if (aliveMembers.length > 0) {
            return aliveMembers.reduce((highestHPMember, currentMember) => {
                if (currentMember.currentHealth > highestHPMember.currentHealth) {
                    return currentMember;
                }
                return highestHPMember;
            }, aliveMembers[0]);
        }
    }
}

export default Team;