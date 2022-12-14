import { ArrowLeftIcon, ArrowRightIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Container,
  CSSObject,
  Flex,
  Input,
  Popover,
  PopoverArrow,
  PopoverBody,
  PopoverCloseButton,
  PopoverContent,
  PopoverHeader,
  PopoverTrigger,
  Spacer,
  useColorModeValue,
} from "@chakra-ui/react";
import { format } from "date-fns";
import { DateObj, Props as DayzedProps, RenderProps, useDayzed } from "dayzed";
import { Calendar as CalendarInterface } from "dayzed";
import React from "react";

const monthNamesShort = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];
const weekdayNamesShort = ["Sun", "M", "Tu", "W", "Th", "F", "Sat"];

type Props = DayzedProps & {
  onDateSelected: (d: DateObj) => void;
  selected?: Date;
};

const DATE_FORMAT = "yyyy/MM/dd";

/*
 * TODO: make it so you can edit the text field by hand
 * and have the datepicker update if the input parses
 * (and reset the value on loss of focus)
 */
const DatePicker = ({ onDateSelected, selected, ...props }: Props) => {
  const dayzedData = useDayzed({ onDateSelected, selected, ...props });
  return (
    <Popover matchWidth>
      <PopoverTrigger>
        <Input
          placeholder="yyyy/mm/dd"
          value={selected ? format(selected, DATE_FORMAT) : ""}
        />
      </PopoverTrigger>
      <Calendar {...dayzedData} />
    </Popover>
  );
};

const Calendar = ({
  calendars,
  getBackProps,
  getForwardProps,
  getDateProps,
}: RenderProps) => {
  // TODO: Convert to semantic colors
  const todayColor = useColorModeValue("purple.100", "purple.800");
  const todayHoverColor = useColorModeValue("purple.50", "purple.900");

  if (calendars.length) {
    return (
      <React.Fragment>
        {calendars.map((calendar: CalendarInterface, i: number) => (
          <PopoverContent
            key={`${calendar.month}${calendar.year}`}
            width="inherit"
          >
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverHeader>
              {monthNamesShort[calendar.month]} {calendar.year}
            </PopoverHeader>
            <PopoverBody padding={0}>
              <Container centerContent paddingX={0}>
                <Flex width="100%">
                  <Button
                    {...getBackProps({ calendars })}
                    size="xs"
                    variant="ghost"
                    borderRadius={0}
                  >
                    <Flex alignItems="center">
                      <ArrowLeftIcon w={3} h={3} pr={1} /> Back
                    </Flex>
                  </Button>
                  <Spacer />
                  <Button
                    {...getForwardProps({ calendars })}
                    size="xs"
                    variant="ghost"
                    borderRadius={0}
                  >
                    <Flex alignItems="center">
                      Next <ArrowRightIcon w={3} h={3} pl={1} />
                    </Flex>
                  </Button>
                </Flex>
                <div
                  style={{
                    padding: "0 var(--ck-space-2) var(--ck-space-2)",
                  }}
                >
                  {weekdayNamesShort.map((weekday) => (
                    <div
                      key={`${calendar.month}${calendar.year}${weekday}`}
                      style={{
                        display: "inline-block",
                        width: "calc(100% / 7)",
                        border: "none",
                        background: "transparent",
                        textAlign: "center",
                      }}
                    >
                      {weekday}
                    </div>
                  ))}
                  {calendar.weeks.map(
                    (week: Array<DateObj | "">, weekIndex: number) =>
                      week.map((dateObj, index) => {
                        const key = `${calendar.month}${calendar.year}${weekIndex}${index}`;
                        if (!dateObj) {
                          return (
                            <Box
                              key={key}
                              style={{
                                display: "inline-block",
                                width: "calc(100% / 7)",
                                border: "none",
                                background: "transparent",
                              }}
                            />
                          );
                        }
                        const { date, selected, selectable, today } = dateObj;
                        const dateStyles: CSSObject = {
                          background: "transparent",
                        };
                        const hoverDateStyles: CSSObject = {};

                        if (today) {
                          dateStyles.background = todayColor;
                          hoverDateStyles.background = todayHoverColor;
                        }
                        if (selected) {
                          dateStyles.background = "purple.400";
                          dateStyles.color = "white";
                          hoverDateStyles.background = "purple.500";
                        }
                        if (!selectable) {
                          hoverDateStyles.background = "transparent";
                        }
                        return (
                          <Button
                            key={key}
                            size="xs"
                            sx={{
                              display: "inline-block",
                              width: "calc(100% / 7)",
                              border: "none",
                              ...dateStyles,

                              "&:hover, &:hover:disabled": {
                                ...hoverDateStyles,
                              },
                            }}
                            {...getDateProps({ dateObj })}
                          >
                            {date.getDate()}
                          </Button>
                        );
                      })
                  )}
                </div>
              </Container>
            </PopoverBody>
          </PopoverContent>
        ))}
      </React.Fragment>
    );
  }
  return null;
};

export default DatePicker;
