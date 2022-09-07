import {
  Box,
  Divider,
  Select,
  Slider,
  Stack,
  Typography,
  Chip,
  ListItem,
  ListItemText,
  List,
  MenuItem,
  Button,
} from "@mui/material";
import * as React from "react";
import styled from "@emotion/styled";
import PropTypes from "prop-types";

const openInNewTab = (url) => {
  const newWindow = window.open(url, "_blank", "noopener,noreferrer");
  if (newWindow) newWindow.opener = null;
};

const AuthorText = styled("div")`
  color: #878787;
`;

const PriorTitleText = styled("div")`
  color: #878787;
  font-weight: bold;
`;

const TitleText = styled("div")`
  font-weight: bold;
`;

function minDateOfPaper(paper) {
  const dates = paper.publications.map(
    (pub) =>
      new Date(
        pub.year,
        pub.month === undefined ? 0 : pub.month,
        pub.day === undefined ? 0 : pub.day
      )
  );
  return new Date(Math.min(...dates));
}

function stringCmp(a, b) {
  var nameA = a.toUpperCase();
  var nameB = b.toUpperCase();
  if (nameA < nameB) {
    return -1;
  }
  if (nameA > nameB) {
    return 1;
  }
  return 0;
}

const SORT_YEAR_TOP_DOWN = "Newest first";
const SORT_YEAR_BOTTOM_UP = "Oldest first";
const sortOptions = [SORT_YEAR_BOTTOM_UP, SORT_YEAR_TOP_DOWN];

const TYPE_LABELS = ["data structure", "online", "running time"];
const PRIOR_LABEL = "prior/related work";
let SPECIAL_LABELS = [...TYPE_LABELS, PRIOR_LABEL];

const PaperList = ({ data }) => {
  // preprocessing
  const allYears = data.flatMap((paper) =>
    paper.publications.flatMap((pub) => pub.year)
  );
  let distinctYears = [...new Set(allYears)];
  distinctYears.sort();
  const allLabels = data.flatMap((paper) => (paper.labels ? paper.labels : []));
  let distinctLabels = [...new Set(allLabels)];
  distinctLabels.sort(stringCmp);
  distinctLabels = distinctLabels.filter((el) => !SPECIAL_LABELS.includes(el));

  // component state definition
  const [yearsIdx, setYearsIdx] = React.useState([0, distinctYears.length - 1]);
  const [sort, setSort] = React.useState(SORT_YEAR_TOP_DOWN);
  const [selLabels, setSelLabels] = React.useState([]);

  // helper functions
  const labelColor = (label) => {
    if (TYPE_LABELS.includes(label)) {
      return "success";
    } else if (label === PRIOR_LABEL) {
      return "default";
    } else {
      return "primary";
    }
  };

  const labelChip = (label, deleteable) => (
    <Chip
      size="small"
      key={label}
      label={label}
      variant={
        (deleteable && selLabels.includes(label)) || label === PRIOR_LABEL
          ? "outlined"
          : "filled"
      }
      color={labelColor(label)}
      onClick={() => setSelLabels([label, ...selLabels])}
      onDelete={
        deleteable && selLabels.includes(label)
          ? () => {
              setSelLabels(selLabels.filter((l) => l !== label));
            }
          : undefined
      }
    />
  );

  const paperChips = (paper) => {
    const labels = "labels" in paper ? paper.labels : [];
    labels.sort(stringCmp);
    let pubs = paper.publications;
    pubs.sort((a, b) => stringCmp(a.name, b.name));
    let chips = paper.publications.map((pub) => {
      let name = "displayName" in pub ? pub.displayName : pub.name;
      let text = name + " '" + pub.year.toString().slice(-2);
      return (
        <Chip
          size="small"
          label={text}
          key={text}
          variant={"arXiv" === name ? "outlined" : "filled"}
          color="secondary"
          onClick={() => ("url" in pub ? openInNewTab(pub.url) : {})}
        />
      );
    });

    chips = chips.concat(labels.map((label) => labelChip(label, false)));

    return chips;
  };

  const buildListItems = (data) => {
    return data.map((paper, i) => (
      <ListItem key={i}>
        <ListItemText
          primary={
            <Stack direction="row" spacing={3}>
              {paper.labels.includes(PRIOR_LABEL) ? (
                <PriorTitleText>{paper.title}</PriorTitleText>
              ) : (
                <TitleText>{paper.title}</TitleText>
              )}
              <AuthorText>{paper.authors}</AuthorText>
              <Stack direction="row" spacing={1}>
                {paperChips(paper)}
              </Stack>
            </Stack>
          }
        />
      </ListItem>
    ));
  };

  const selTypeLabels = selLabels.filter((l) => TYPE_LABELS.includes(l));
  const selNonTypeLabels = selLabels.filter((l) => !TYPE_LABELS.includes(l));

  // data preparation
  const filteredData = data
    .filter((p) =>
      p.publications.some(
        (pub) =>
          distinctYears[yearsIdx[0]] <= pub.year &&
          pub.year <= distinctYears[yearsIdx[1]]
      )
    )
    .filter(
      (p) =>
        (selTypeLabels.length === 0 ||
          selTypeLabels.every((l) => p.labels.includes(l))) &&
        (selNonTypeLabels.length === 0 ||
          p.labels.some((l) => selNonTypeLabels.includes(l)))
    );
  const sortedData = filteredData.sort(function (p1, p2) {
    if (sort === SORT_YEAR_TOP_DOWN) {
      return minDateOfPaper(p2) - minDateOfPaper(p1);
    } else {
      return minDateOfPaper(p1) - minDateOfPaper(p2);
    }
  });
  const items = buildListItems(sortedData);
  const marks = Array.from(new Array(distinctYears.length), (x, i) => i).map(
    (yearIdx) => ({
      value: yearIdx,
      label: "'" + distinctYears[yearIdx].toString().slice(-2),
    })
  );

  return (
    <div>
      <Stack
        direction="row"
        justifyContent={"space-between"}
        alignItems="center"
      >
        <Stack
          direction="row"
          p={1}
          spacing={2}
          alignItems="center"
          justifyContent={"flex-start"}
        >
          <Box sx={{ width: 350, pr: 2 }}>
            <Slider
              value={yearsIdx}
              step={null}
              max={distinctYears.length - 1}
              onChange={(_, newValue) => setYearsIdx(newValue)}
              valueLabelFormat={(value) => distinctYears[value]}
              valueLabelDisplay="auto"
              marks={marks}
              disableSwap
            />
          </Box>
          <Select
            value={sort}
            autoWidth={true}
            onChange={(event) => setSort(event.target.value)}
          >
            {sortOptions.map((opt) => (
              <MenuItem key={opt} value={opt}>
                {opt}
              </MenuItem>
            ))}
          </Select>
          <Typography>{items.length} papers</Typography>
        </Stack>
        {selLabels.length > 0 && (
          <Button
            variant="contained"
            color="error"
            onClick={() => setSelLabels([])}
          >
            Reset
          </Button>
        )}
      </Stack>
      <Divider />
      <Stack
        spacing={1}
        direction="row" //{{ md: "column-reverse", lg: "row" }}
        alignItems="stretch"
        justifyContent={"space-between"}
      >
        <List dense="true">{items}</List>
        <Box sx={{ display: "flex" }}>
          <Divider orientation={"vertical"} flexItem />
          <Stack
            flexWrap={"wrap"}
            pl={1}
            pt={1}
            spacing={1}
            direction="column" //"row", lg: "column" }}
          >
            {SPECIAL_LABELS.map((l) => labelChip(l, true))}
            <Divider orientation={"horizontal"} flexItem />
            {distinctLabels.map((l) => labelChip(l, true))}
          </Stack>
        </Box>
      </Stack>
    </div>
  );
};

PaperList.propTypes = {
  data: PropTypes.array,
};

export default PaperList;
