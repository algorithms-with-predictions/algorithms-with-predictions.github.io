import {
  Box,
  Container,
  Link,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import {
  AccountBalance as AccountBalanceIcon,
  Groups as GroupsIcon,
  LocationOn as LocationOnIcon,
  MailOutline as MailOutlineIcon,
  Person as PersonIcon,
  Schedule as ScheduleIcon,
} from '@mui/icons-material';
import type { ReactNode } from 'react';
import mathplusLogo from '../../workshop/mathplus.png';
import tuBerlinLogo from '../../workshop/tuberlin.png';
import buaLogo from '../../workshop/bua.png';
import melbourneLogo from '../../workshop/melbourne.jpg';
import directionsImage from '../../workshop/directions.png';

const organizers = [
  {
    name: 'Franziska Eberle',
    affiliation: 'TU Berlin',
  },
  {
    name: 'Alexander Lindermayr',
    affiliation: 'TU Berlin',
  },
  {
    name: 'William Umboh',
    affiliation: 'University of Melbourne',
  },
];

const participants = [
  {
    name: 'Antonios Antoniadis',
    affiliation: 'University of Twente',
  },
  {
    name: 'Sebastian Bruchhold',
    affiliation: 'TU Berlin',
  },
  {
    name: 'Christian Coester',
    affiliation: 'University of Oxford',
  },
  {
    name: 'Romain Cosson',
    affiliation: 'New York University',
  },
  {
    name: 'Julien Dallot',
    affiliation: 'TU Berlin',
  },
  {
    name: 'Laura Eichelberger',
    affiliation: 'TU Berlin',
  },
  {
    name: 'Ekin Ergen',
    affiliation: 'TU Berlin',
  },
  {
    name: 'Marek Eliáš',
    affiliation: 'Bocconi University',
  },
  {
    name: 'Franziska Eberle',
    affiliation: 'TU Berlin',
  },
  {
    name: 'Lene Favrholdt',
    affiliation: 'University of Southern Denmark',
  },
  {
    name: 'Denise Graafsma',
    affiliation: 'University of Twente',
  },
  {
    name: 'Ruben Hoeksma',
    affiliation: 'University of Twente',
  },
  {
    name: 'Danish Kashaev',
    affiliation: 'University of Oxford',
  },
  {
    name: 'Kim Skak Larsen',
    affiliation: 'University of Southern Denmark',
  },
  {
    name: 'Alexander Lindermayr',
    affiliation: 'TU Berlin',
  },
  {
    name: 'Guido Schäfer',
    affiliation: 'CWI',
  },
  {
    name: 'Stefan Schmid',
    affiliation: 'TU Berlin',
  },
  {
    name: 'Jonas Schmidt',
    affiliation: 'Bocconi University',
  },
  {
    name: 'Jens Schlöter',
    affiliation: 'CWI',
  },
  {
    name: 'Yongho Shin',
    affiliation: 'University of Wrocław',
  },
  {
    name: 'Bertrand Simon',
    affiliation: 'CNRS, LIG Grenoble',
  },
  {
    name: 'Martin Skutella',
    affiliation: 'TU Berlin',
  },
  {
    name: 'Xiao Sun',
    affiliation: 'University of Melbourne',
  },
  {
    name: 'Alexa Tudose',
    affiliation: 'University of Oxford',
  },
  {
    name: 'William Umboh',
    affiliation: 'University of Melbourne',
  },
  {
    name: 'Yixiang Wang',
    affiliation: 'University of Melbourne',
  },
];

const funderLogos = [
  {
    name: 'MATH+',
    src: mathplusLogo,
  },
  {
    name: 'Berlin University Alliance',
    src: buaLogo,
  },
  {
    name: 'TU Berlin',
    src: tuBerlinLogo,
  },
  {
    name: 'University of Melbourne',
    src: melbourneLogo,
  },
];

const schedule = [
  {
    date: 'Monday, August 24',
    time: '09:00-09:30',
    session: 'Get together',
  },
  {
    date: 'Monday, August 24',
    time: '09:30-10:00',
    session: 'Introduction',
  },
  {
    date: 'Monday, August 24',
    time: '10:00-11:00',
    session:
      'Lene Favrholdt: On the Complexity of Online Problems with Predictions',
  },
  {
    date: 'Monday, August 24',
    time: '11:00-11:30',
    session: 'Coffee',
  },
  {
    date: 'Monday, August 24',
    time: '11:30-12:00',
    session:
      'Yongho Shin: Learning-Augmented Online Bipartite Fractional Matching',
  },
  {
    date: 'Monday, August 24',
    time: '12:00-12:30',
    session: 'Danish Kashaev: Improved Online Load Balancing in the Two-Norm',
  },
  {
    date: 'Monday, August 24',
    time: '12:30-14:30',
    session: 'Lunch',
  },
  {
    date: 'Monday, August 24',
    time: '14:30-15:00',
    session:
      'Jonas Schmidt: Warm-Starting All-Pairs Shortest Paths with Predictions',
  },
  {
    date: 'Monday, August 24',
    time: '15:00-15:30',
    session:
      'Marek Elias: TSP with Predictions: Heatmap to Tour with Provable Guarantees',
  },
  {
    date: 'Monday, August 24',
    time: '15:30-16:00',
    session: 'Coffee',
  },
  {
    date: 'Monday, August 24',
    time: '16:00-16:40',
    session:
      'Short Talks: Xiao Sun, Sebastian Bruchhold, Denise Graafsma, Yixiang Wang',
  },
  {
    date: 'Monday, August 24',
    time: '16:40-17:10',
    session:
      'Romain Cosson: An Average-Case Perspective on Average-Case Analysis',
  },
  {
    date: 'Tuesday, August 25',
    time: '09:30-10:30',
    session:
      'Christian Coester: Learning-Augmented Online Minimization with Dual Predictions',
  },
  {
    date: 'Tuesday, August 25',
    time: '10:30-11:00',
    session: 'Coffee',
  },
  {
    date: 'Tuesday, August 25',
    time: '11:00-11:30',
    session: 'Alexa Tudose: Stochastic Metrical Task Systems',
  },
  {
    date: 'Tuesday, August 25',
    time: '11:30-12:00',
    session: 'Julien Dallot: Online Algorithms with Unreliable Guidance',
  },
  {
    date: 'Tuesday, August 25',
    time: '12:00-12:30',
    session: 'Guido Schäfer: Improved Bounds for Facility Location Mechanisms',
  },
  {
    date: 'Tuesday, August 25',
    time: '12:30-14:30',
    session: 'Lunch',
  },
  {
    date: 'Tuesday, August 25',
    time: '14:30-15:00',
    session:
      'Jens Schlöter: Better Late Than Never: Online Flow Time Scheduling with Online Estimates',
  },
  {
    date: 'Tuesday, August 25',
    time: '15:00-15:30',
    session:
      'Seeun William Umboh: Learning-Augmented Online Algorithms for Nonclairvoyant Joint Replenishment Problem with Deadlines',
  },
  {
    date: 'Tuesday, August 25',
    time: '15:30-16:00',
    session: 'Coffee',
  },
  {
    date: 'Tuesday, August 25',
    time: '16:00-17:30',
    session: 'Open Problem Session and Discussion',
  },
  {
    date: 'Tuesday, August 25',
    time: '19:00',
    session: 'Workshop Dinner',
  },
  {
    date: 'Wednesday, August 26',
    time: '09:00-10:00',
    session: 'Get together & Open Problems',
  },
  {
    date: 'Wednesday, August 26',
    time: '10:00-12:00',
    session: 'Collaboration Time w/ Coffee',
  },
  {
    date: 'Wednesday, August 26',
    time: '12:00-14:00',
    session: 'Lunch',
  },
  {
    date: 'Wednesday, August 26',
    time: '14:00',
    session: 'Get together & Discussion',
  },
  {
    date: 'Wednesday, August 26',
    time: '14:00-17:00',
    session: 'Collaboration Time w/ Coffee',
  },
  {
    date: 'Thursday, August 27',
    time: '09:00',
    session: 'Get together & Discussion',
  },
  {
    date: 'Thursday, August 27',
    time: '09:00-12:00',
    session: 'Collaboration Time w/ Coffee',
  },
  {
    date: 'Thursday, August 27',
    time: '12:00-14:00',
    session: 'Lunch',
  },
  {
    date: 'Thursday, August 27',
    time: '14:00',
    session: 'Get together & Discussion',
  },
  {
    date: 'Thursday, August 27',
    time: '14:00-17:00',
    session: 'Collaboration Time w/ Coffee',
  },
  {
    date: 'Friday, August 28',
    time: '09:00',
    session: 'Get together & Discussion',
  },
  {
    date: 'Friday, August 28',
    time: '09:00-11:00',
    session: 'Collaboration Time w/ Coffee',
  },
  {
    date: 'Friday, August 28',
    time: '11:00-12:00',
    session: 'Wrap-Up',
  },
  {
    date: 'Friday, August 28',
    time: '12:00',
    session: 'Lunch',
  },
];

const scheduleDays = [...new Set(schedule.map(item => item.date))];

const formatScheduleSession = (session: string) => {
  const separatorIndex = session.indexOf(':');

  if (separatorIndex === -1) {
    return session;
  }

  const label = session.slice(0, separatorIndex);
  const details = session.slice(separatorIndex + 1).trim();

  if (label === 'Short Talks') {
    return (
      <>
        {label}:{' '}
        <Box component="span" sx={{ fontWeight: 600 }}>
          {details}
        </Box>
      </>
    );
  }

  return (
    <>
      <Box component="span" sx={{ fontWeight: 600 }}>
        {label}
      </Box>
      : {details}
    </>
  );
};

const sectionSx = {
  pt: { xs: 3, md: 3.5 },
  borderTop: 1,
  borderColor: 'divider',
};

const SectionHeading = ({
  id,
  icon,
  children,
}: {
  id: string;
  icon: ReactNode;
  children: ReactNode;
}) => (
  <Stack direction="row" spacing={1.25} alignItems="center" sx={{ mb: 1.5 }}>
    <Box sx={{ color: 'primary.main', display: 'flex' }}>{icon}</Box>
    <Typography id={id} variant="h5" component="h2">
      {children}
    </Typography>
  </Stack>
);

const WorkshopPage: React.FC = () => {
  return (
    <Container maxWidth="xl" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={{ xs: 3.5, md: 4 }} sx={{ maxWidth: 1280, mx: 'auto' }}>
        <Box
          component="header"
          sx={{
            borderLeft: 4,
            borderColor: 'secondary.main',
            pl: { xs: 2, sm: 3 },
            py: 1,
          }}
        >
          <Typography variant="h3" component="h1" gutterBottom>
            New Frontiers in Learning-Augmented Algorithms
          </Typography>
          <Typography variant="h6" component="p" color="text.secondary">
            August 24 to 28, 2026
          </Typography>
          <Typography variant="h6" component="p" color="text.secondary">
            TU Berlin, Germany
          </Typography>
        </Box>

        <Box
          component="section"
          aria-labelledby="organizers-heading"
          sx={sectionSx}
        >
          <SectionHeading
            id="organizers-heading"
            icon={<PersonIcon aria-hidden="true" />}
          >
            Organizers
          </SectionHeading>
          <Box component="ul" sx={{ pl: 3, my: 0 }}>
            {organizers.map(organizer => (
              <li key={`${organizer.name}-${organizer.affiliation}`}>
                <Typography component="span" sx={{ fontWeight: 500 }}>
                  {organizer.name}
                </Typography>
                <Typography component="span" color="text.secondary">
                  {' '}
                  ({organizer.affiliation})
                </Typography>
              </li>
            ))}
          </Box>
        </Box>

        <Box component="section" aria-labelledby="venue-heading" sx={sectionSx}>
          <SectionHeading
            id="venue-heading"
            icon={<LocationOnIcon aria-hidden="true" />}
          >
            Venue
          </SectionHeading>
          <Typography paragraph>
            The workshop will take place at the TU Berlin in the new IMoS
            building (
            <Link
              href="https://maps.app.goo.gl/xx7si4CLjCaNL2in9"
              target="_blank"
              rel="noopener noreferrer"
            >
              Fasanenstraße 90, 10623 Berlin
            </Link>
            ) on Campus Charlottenburg.
          </Typography>
          <Typography color="text.secondary" paragraph>
            <Link
              href={directionsImage}
              target="_blank"
              rel="noopener noreferrer"
            >
              The only access (due to ongoing construction work) is via Müller-Breslau-Straße.
            </Link>
          </Typography>
          <Typography>
            The closest stations for public transport (S-Bahn, U-Bahn) are Tiergarten and Zoologischer Garten.
          </Typography>
        </Box>

        <Box
          component="section"
          aria-labelledby="schedule-heading"
          sx={sectionSx}
        >
          <SectionHeading
            id="schedule-heading"
            icon={<ScheduleIcon aria-hidden="true" />}
          >
            Schedule
          </SectionHeading>
          <Box
            sx={{
              mb: 2,
              px: 2,
              py: 1.5,
              borderRadius: 1.5,
              bgcolor: 'action.hover',
              color: 'text.secondary',
            }}
          >
            <Typography variant="body2">
              <Box
                component="span"
                sx={{ fontWeight: 600, color: 'text.primary' }}
              >
                Catered lunch:
              </Box>{' '}
              Vegan bowls will be provided at the venue. There will be
              additional time for a walk or ice cream.
            </Typography>
          </Box>
          <Stack spacing={2}>
            {scheduleDays.map(date => {
              const daySchedule = schedule.filter(item => item.date === date);

              return (
                <Paper
                  key={date}
                  variant="outlined"
                  sx={{ borderRadius: 2, overflow: 'hidden' }}
                >
                  <Box
                    sx={{
                      px: { xs: 2, sm: 2.5 },
                      py: 1.25,
                      bgcolor: 'primary.main',
                      color: 'primary.contrastText',
                    }}
                  >
                    <Typography variant="h6" component="h3">
                      {date}
                    </Typography>
                  </Box>
                  <TableContainer>
                    <Table aria-label={`Schedule for ${date}`} size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell sx={{ width: { xs: 120, sm: 170 } }}>
                            Time
                          </TableCell>
                          <TableCell>Session</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {daySchedule.map(item => {
                          const isBreak =
                            item.session === 'Coffee' ||
                            item.session.startsWith('Lunch');

                          return (
                            <TableRow
                              key={item.time}
                              sx={{
                                bgcolor: isBreak
                                  ? 'action.hover'
                                  : 'transparent',
                                '&:last-child td, &:last-child th': {
                                  borderBottom: 0,
                                },
                              }}
                            >
                              <TableCell
                                component="th"
                                scope="row"
                                sx={{
                                  whiteSpace: 'nowrap',
                                  fontWeight: 600,
                                  fontVariantNumeric: 'tabular-nums',
                                }}
                              >
                                {item.time}
                              </TableCell>
                              <TableCell
                                sx={{
                                  color: isBreak
                                    ? 'text.secondary'
                                    : 'text.primary',
                                  fontStyle: isBreak ? 'italic' : 'normal',
                                }}
                              >
                                {formatScheduleSession(item.session)}
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Paper>
              );
            })}
          </Stack>
        </Box>

        <Box
          component="section"
          aria-labelledby="participants-heading"
          sx={sectionSx}
        >
          <SectionHeading
            id="participants-heading"
            icon={<GroupsIcon aria-hidden="true" />}
          >
            Participants
          </SectionHeading>
          <Box component="ul" sx={{ pl: 3, my: 0 }}>
            {participants.map(participant => (
              <li key={`${participant.name}-${participant.affiliation}`}>
                <Typography component="span" sx={{ fontWeight: 500 }}>
                  {participant.name}
                </Typography>
                <Typography component="span" color="text.secondary">
                  {' '}
                  ({participant.affiliation})
                </Typography>
              </li>
            ))}
          </Box>
        </Box>

        <Box
          component="section"
          aria-labelledby="contact-heading"
          sx={sectionSx}
        >
          <SectionHeading
            id="contact-heading"
            icon={<MailOutlineIcon aria-hidden="true" />}
          >
            Contact
          </SectionHeading>
          <Typography>
            For questions, contact{' '}
            <Link href="mailto:alexander.lindermayr@tu-berlin.de">
              alexander.lindermayr@tu-berlin.de
            </Link>
            .
          </Typography>
        </Box>

        <Box
          component="section"
          aria-labelledby="funders-heading"
          sx={sectionSx}
        >
          <SectionHeading
            id="funders-heading"
            icon={<AccountBalanceIcon aria-hidden="true" />}
          >
            Supported By
          </SectionHeading>
          <Box
            sx={{
              display: 'grid',
              gridTemplateColumns: {
                xs: 'repeat(2, minmax(0, 1fr))',
                sm: 'repeat(4, minmax(0, 1fr))',
              },
              gap: 2,
              alignItems: 'center',
            }}
          >
            {funderLogos.map(logo => (
              <Box
                key={logo.name}
                sx={{
                  height: { xs: 72, sm: 84 },
                  border: 1,
                  borderColor: 'divider',
                  borderRadius: 1,
                  bgcolor: theme =>
                    theme.palette.mode === 'dark'
                      ? '#f7f9fc'
                      : 'background.paper',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  p: 1.5,
                }}
              >
                <Box
                  component="img"
                  src={logo.src}
                  alt={logo.name}
                  sx={{
                    maxWidth: '100%',
                    maxHeight: { xs: 44, sm: 54 },
                    objectFit: 'contain',
                  }}
                />
              </Box>
            ))}
          </Box>
        </Box>
      </Stack>
    </Container>
  );
};

export default WorkshopPage;
