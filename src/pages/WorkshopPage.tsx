import {
  Box,
  Container,
  Divider,
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
    name: 'Sebastian Bruchold',
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
    name: 'Gerald Huang',
    affiliation: 'University of Melbourne',
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
    time: '09:00-17:00',
    session: 'TBA',
  },
  {
    date: 'Tuesday, August 25',
    time: '09:00-17:00',
    session: 'TBA',
  },
  {
    date: 'Wednesday, August 26',
    time: '09:00-17:00',
    session: 'TBA',
  },
  {
    date: 'Thursday, August 27',
    time: '09:00-17:00',
    session: 'TBA',
  },
  {
    date: 'Friday, August 28',
    time: '09:00-12:00',
    session: 'TBA',
  },
];

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
    <Container maxWidth="lg" sx={{ py: { xs: 3, md: 5 } }}>
      <Stack spacing={4.5} sx={{ maxWidth: 1120, mx: 'auto' }}>
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

        <Divider />

        <Box component="section" aria-labelledby="organizers-heading">
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

        <Box component="section" aria-labelledby="venue-heading">
          <SectionHeading
            id="venue-heading"
            icon={<LocationOnIcon aria-hidden="true" />}
          >
            Venue
          </SectionHeading>
          <Typography paragraph>
            The workshop will take place at the TU Berlin in the new IMoS
            building on Campus Charlottenburg.
          </Typography>
          <Typography color="text.secondary">
            Detailed directions will be provided later.
          </Typography>
        </Box>

        <Box component="section" aria-labelledby="schedule-heading">
          <SectionHeading
            id="schedule-heading"
            icon={<ScheduleIcon aria-hidden="true" />}
          >
            Schedule
          </SectionHeading>
          <TableContainer
            component={Paper}
            variant="outlined"
            sx={{ borderRadius: 1 }}
          >
            <Table aria-label="Workshop schedule" size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: { xs: 140, sm: 200 } }}>
                    Date
                  </TableCell>
                  <TableCell sx={{ width: { xs: 110, sm: 140 } }}>
                    Time
                  </TableCell>
                  <TableCell>Session</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {schedule.map(item => (
                  <TableRow key={item.date}>
                    <TableCell component="th" scope="row">
                      {item.date}
                    </TableCell>
                    <TableCell>{item.time}</TableCell>
                    <TableCell>{item.session}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>

        <Box component="section" aria-labelledby="participants-heading">
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

        <Box component="section" aria-labelledby="contact-heading">
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

        <Box component="section" aria-labelledby="funders-heading">
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
