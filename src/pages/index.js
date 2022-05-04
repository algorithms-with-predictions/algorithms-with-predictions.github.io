import * as React from "react";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import ListItem from "@mui/material/ListItem";
import Chip from "@mui/material/Chip";
import {
  AppBar,
  Container,
  Divider,
  FormControl,
  FormGroup,
  MenuItem,
  Select,
  Slider,
  Stack,
  Toolbar,
  Typography,
} from "@mui/material";
import "@fontsource/roboto/400.css";
import styled from "@emotion/styled";
import data from "../../content/papers.json";

const AuthorText = styled("div")`
  color: #878787;
`;

const TitleText = styled("div")`
  font-weight: bold;
`;

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

function chips(paper) {
  let labels = paper.labels.map((label) => (
    <Chip size="small" label={label} color="primary" />
  ));

  for (const [conf, confObj] of Object.entries(paper.publications)) {
    let text = conf + " " + confObj.year;
    if ("url" in confObj) {
      labels.push(
        <Chip
          size="small"
          label={text}
          color="secondary"
          onClick={() => openInNewTab(confObj.url)}
        />
      );
    } else {
      labels.push(<Chip size="small" label={text} color="secondary" />);
    }
  }

  return labels;
}

const items = data.map((paper) => (
  <ListItem>
    <ListItemText
      primary={
        <Stack direction="row" spacing={3}>
          <TitleText>{paper.title}</TitleText>
          <AuthorText>{paper.authors.join(", ")}</AuthorText>
          <Stack direction="row" spacing={1}>
            {chips(paper)}
          </Stack>
        </Stack>
      }
    />
  </ListItem>
));

// markup
const IndexPage = () => {
  const [years, setYears] = React.useState([2018, 2022]);
  const [sort, setSort] = React.useState("YearTopDown");

  const handleSort = (event) => {
    setSort(event.target.value);
  };

  return (
    <div>
      <Container maxWidth="None">
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
              Paper List
            </Typography>
          </Toolbar>
        </AppBar>
       
          <Stack direction="row" justifyContent={"space-between"} alignContent={"baseline"}>
          <Slider
            getAriaLabel={() => "Minimum distance"}
            value={years}
            min={2018}
            max={2022}
            onChange={(event, newValue) => setYears(newValue)}
            valueLabelDisplay="auto"
            marks={true}
            disableSwap
            />
          <Select
            value={sort}
            label=""
            onChange={handleSort}
          >
            <MenuItem value={"YearTopDown"}>Newest First</MenuItem>
            <MenuItem value={"YearDownTop"}>Oldest First</MenuItem>
          </Select>
        </Stack>
        
        <Divider></Divider>
        <List dense="true">{items}</List>
      </Container>
    </div>
  );
};

export default IndexPage;
