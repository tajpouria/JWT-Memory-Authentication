import React from "react";
import {
  Formik,
  Form,
  Field,
  FormikHelpers,
  useField,
  FieldAttributes,
  FieldArray
} from "formik";
import {
  TextField,
  Checkbox,
  Button,
  FormControlLabel,
  Radio,
  MenuItem,
  Select
} from "@material-ui/core";

import "./App.css";
import { TextFieldProps } from "@material-ui/core/TextField";

type MyRadioProps = { label: string } & FieldAttributes<{}>;

const MyRadio: React.FC<MyRadioProps> = ({ label, ...props }) => {
  const [field] = useField<{}>(props);
  return <FormControlLabel label={label} control={<Radio {...field} />} />;
};

const MyTextField: React.FC<FieldAttributes<{}>> = ({
  placeholder,
  ...props
}) => {
  const [field, meta] = useField<{}>(props);
  const errorText = meta.error && meta.touched ? meta.error : "";
  return (
    <TextField
      {...field}
      placeholder={placeholder}
      helperText={errorText}
      error={!!errorText}
    />
  );
};

const App: React.FC = () => {
  const handleSubmit = (
    values: any,
    { setSubmitting, resetForm }: FormikHelpers<any>
  ) => {
    setSubmitting(true);
    console.log(values);
    setSubmitting(false);
    resetForm();
  };

  return (
    <div className="App">
      <header className="App-header">
        <Formik
          initialValues={{
            firstName: "",
            lastName: "",
            isTall: false,
            cookies: [],
            yogurt: "",
            milk: "",
            noBob: "",
            pets: [{ type: "cat", name: "bob", id: Math.random() + "" }]
          }}
          onSubmit={handleSubmit}
          validate={values => {
            const errors: Record<string, string> = {};

            if (values.noBob === "bob") {
              errors.noBob = "noBob";
            }
            return errors;
          }}
        >
          {({ values }) => (
            <Form>
              <div>
                <Field
                  name="firstName"
                  placeholder="first name"
                  type="text"
                  as={TextField}
                />
              </div>
              <div>
                <Field
                  name="lastName"
                  placeholder="last name"
                  type="text"
                  as={TextField}
                />
              </div>
              <div>
                <FormControlLabel
                  control={
                    <Field name="isTall" type="checkbox" as={Checkbox} />
                  }
                  label="is tall"
                />
              </div>
              <div>
                <FormControlLabel
                  label="cookie A"
                  control={
                    <Field
                      name="cookie"
                      type="checkbox"
                      value="cookieA"
                      as={Checkbox}
                    />
                  }
                />
                <FormControlLabel
                  label="cookie B"
                  control={
                    <Field
                      name="cookie"
                      type="checkbox"
                      value="cookieB"
                      as={Checkbox}
                    />
                  }
                />
                <FormControlLabel
                  label="cookie C"
                  control={
                    <Field
                      name="cookie"
                      type="checkbox"
                      value="cookieC"
                      as={Checkbox}
                    />
                  }
                />
              </div>
              <div>
                <Field name="yogurt" value="apple" type="radio" as={Radio} />
                <Field
                  name="yogurt"
                  value="pineapple"
                  type="radio"
                  as={Radio}
                />
                <Field
                  name="yogurt"
                  value="blueberry"
                  type="radio"
                  as={Radio}
                />
              </div>
              <div>
                <MyRadio
                  label="chocolate"
                  type="radio"
                  name="milk"
                  value="chocolate"
                />
                <MyRadio
                  label="strawberry"
                  type="radio"
                  name="milk"
                  value="strawberry"
                />
              </div>
              <div>
                <MyTextField name="noBob" placeholder="noBob" type="text" />
              </div>
              <FieldArray name="pets">
                {arrayHelpers => (
                  <div>
                    <Button
                      onClick={() =>
                        arrayHelpers.push({
                          type: "frog",
                          name: "",
                          id: "" + Math.random()
                        })
                      }
                    >
                      add pet
                    </Button>
                    {values.pets.map((pet, index) => {
                      return (
                        <div key={pet.id}>
                          <MyTextField
                            placeholder="pet name"
                            name={`pets.${index}.name`}
                          />
                          <Field
                            name={`pets.${index}.type`}
                            type="select"
                            as={Select}
                          >
                            <MenuItem value="cat">cat</MenuItem>
                            <MenuItem value="dog">dog</MenuItem>
                            <MenuItem value="frog">frog</MenuItem>
                          </Field>
                          <Button onClick={() => arrayHelpers.remove(index)}>
                            x
                          </Button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </FieldArray>

              <Button type="submit">Submit</Button>
              <pre className="output">{JSON.stringify(values, null, 2)}</pre>
            </Form>
          )}
        </Formik>
      </header>
    </div>
  );
};

export default App;
