export function selectTarget(attacker, targetMode) {
  let target;

  switch (targetMode) {
    case 'Random':
        target = attacker.opposingTeam.getRandomAliveMember();
        break;
    case 'Random Front':
      target = attacker.opposingTeam.getRandomFrontMember();
      break;
    case 'Random Back':
      target = attacker.opposingTeam.getRandomBackMember();
      break;
    case 'Random Any':
      target = attacker.opposingTeam.getRandomAliveMember();
      break;
    case 'Random Team Front':
      target = attacker.team.getRandomFrontMember();
      break;
    case 'Random Team Back':
      target = attacker.team.getRandomBackMember();
      break;
    case 'Random Team Any':
      target = attacker.team.getRandomAliveMember();
      break;
    case 'Self':
      target = attacker;
      break;
    case 'Specific Enemy Front X':
      target = attacker.opposingTeam.getFrontMember(X);
      break;
    case 'Specific Enemy Back X':
      target = attacker.opposingTeam.getBackMember(X);
      break;
    case 'Specific Ally Front X':
      target = attacker.team.getFrontMember(X);
      break;
    case 'Specific Ally Back X':
      target = attacker.team.getBackMember(X);
      break;
    case 'All Front':
      target = attacker.opposingTeam.getAllFrontMembers();
      break;
    case 'All Back':
      target = attacker.opposingTeam.getAllBackMembers();
      break;
    case 'All Any':
      target = attacker.opposingTeam.getAllAliveMembers();
      break;
    case 'All Team Front':
      target = attacker.team.getAllFrontMembers();
      break;
    case 'All Team Back':
      target = attacker.team.getAllBackMembers();
      break;
    case 'All Team Any':
      target = attacker.team.getAllAliveMembers();
      break;
    case 'Row Front':
      target = attacker.battlefield.getRowFrontMembers(attacker);
      break;
    case 'Row Back':
      target = attacker.battlefield.getRowBackMembers(attacker);
      break;
    case 'All Characters':
      target = attacker.battlefield.getAllCharacters();
      break;
    case 'Lowest HP Front':
      target = attacker.opposingTeam.getLowestHPFrontMember();
      break;
    case 'Lowest HP Back':
      target = attacker.opposingTeam.getLowestHPBackMember();
      break;
    case 'Lowest HP Any':
      target = attacker.opposingTeam.getLowestHPMember();
      break;
    case 'Highest HP Front':
      target = attacker.opposingTeam.getHighestHPFrontMember();
      break;
    case 'Highest HP Back':
      target = attacker.opposingTeam.getHighestHPBackMember();
      break;
    case 'Highest HP Any':
      target = attacker.opposingTeam.getHighestHPMember();
      break;
    case 'Lowest HP Team Front':
      target = attacker.team.getLowestHPFrontMember();
      break;
    case 'Lowest HP Team Back':
      target = attacker.team.getLowestHPBackMember();
      break;
    case 'Lowest HP Team Any':
      target = attacker.team.getLowestHPMember();
      break;
    case 'Highest HP Team Front':
      target = attacker.team.getHighestHPFrontMember();
      break;
    case 'Highest HP Team Back':
      target = attacker.team.getHighestHPBackMember();
      break;
    case 'Highest HP Team Any':
      target = attacker.team.getHighestHPMember();
      break;
    case 'Column 1':
      target = attacker.battlefield.getColumnMembers(1);
      break;
    case 'Column 2':
      target = attacker.battlefield.getColumnMembers(2);
      break;
    case 'Column 3':
      target = attacker.battlefield.getColumnMembers(3);
      break;
    case 'Column 4':
      target = attacker.battlefield.getColumnMembers(4);
      break;
    case 'Adjacent Enemies':
      target = attacker.opposingTeam.getAdjacentMembers(attacker);
      break;
    case 'Adjacent Allies':
      target = attacker.team.getAdjacentMembers(attacker);
      break;
    case 'Diagonal from Caster':
      target = attacker.battlefield.getDiagonalMembers(attacker);
      break;
    case 'Diagonal from Target':
      break;
    default:
      console.error(`Invalid target mode: ${targetMode}`);
      break;
  }
    if (target === undefined) {
        console.error(`Invalid target mode: ${targetMode}`);
    }
  return target;
}